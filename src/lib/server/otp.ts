import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { HttpError, rateLimit } from "@/lib/server/guard";
import { sendOtpEmail } from "@/lib/server/email";
import { absUrl } from "@/lib/seo";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const VERIFY_LINK_TTL_MS = 24 * 60 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const SEND_LIMIT_EMAIL = 5;
const SEND_LIMIT_IP = 20;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const VERIFY_LIMIT_EMAIL = 15;
const VERIFY_LIMIT_IP = 30;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_LINK_PREFIX = "email-verify:";

type SendSignupOtpOpts = {
  /** Admin toplu hatırlatma — rate limit / cooldown atlanır. */
  adminBulk?: boolean;
};

function otpPepper(): string {
  return process.env.OTP_PEPPER || process.env.BETTER_AUTH_SECRET || "dev-otp-pepper";
}

function generateOtpCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

function generateLinkToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashSecret(value: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(`${value}${otpPepper()}`, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifySecretHash(value: string, stored: string): boolean {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actualHex = scryptSync(`${value}${otpPepper()}`, salt, 32).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(actualHex, "hex"));
  } catch {
    return false;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new HttpError(400, "Geçerli bir e-posta adresi girin.");
  }
  return normalized;
}

function verifyLinkIdentifier(email: string): string {
  return `${VERIFY_LINK_PREFIX}${email}`;
}

export function buildVerifyEmailUrl(email: string, token: string): string {
  const params = new URLSearchParams({
    email,
    token,
  });
  return `${absUrl("/verify-email")}?${params.toString()}`;
}

async function invalidateActiveOtps(email: string, purpose: "signup"): Promise<void> {
  await db
    .update(schema.emailOtps)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.emailOtps.email, email),
        eq(schema.emailOtps.purpose, purpose),
        isNull(schema.emailOtps.usedAt),
      ),
    );
}

async function invalidateVerifyLink(email: string): Promise<void> {
  await db
    .delete(schema.verification)
    .where(eq(schema.verification.identifier, verifyLinkIdentifier(email)));
}

async function storeVerifyLinkToken(email: string, token: string): Promise<void> {
  await invalidateVerifyLink(email);
  await db.insert(schema.verification).values({
    identifier: verifyLinkIdentifier(email),
    value: hashSecret(token),
    expiresAt: new Date(Date.now() + VERIFY_LINK_TTL_MS),
  });
}

async function enforceResendCooldown(email: string, purpose: "signup"): Promise<void> {
  const [recent] = await db
    .select({ createdAt: schema.emailOtps.createdAt })
    .from(schema.emailOtps)
    .where(and(eq(schema.emailOtps.email, email), eq(schema.emailOtps.purpose, purpose)))
    .orderBy(desc(schema.emailOtps.createdAt))
    .limit(1);

  if (!recent) return;

  const elapsed = Date.now() - recent.createdAt.getTime();
  if (elapsed < OTP_RESEND_COOLDOWN_MS) {
    const secs = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
    throw new HttpError(429, `Yeni kod ${secs} saniye sonra istenebilir.`);
  }
}

async function markEmailVerified(userId: string): Promise<void> {
  const now = new Date();
  await db
    .update(schema.user)
    .set({ emailVerified: true, updatedAt: now })
    .where(eq(schema.user.id, userId));
  await db
    .update(schema.profiles)
    .set({ emailVerified: true, updatedAt: now })
    .where(eq(schema.profiles.id, userId));
}

/** Kayıt / e-posta doğrulama OTP'si + doğrulama bağlantısı gönder. */
export async function sendSignupOtp(
  email: string,
  ip: string,
  opts?: SendSignupOtpOpts,
): Promise<{ verifyUrl: string }> {
  const normalized = assertEmail(email);
  const adminBulk = opts?.adminBulk === true;

  if (!adminBulk) {
    rateLimit(`otp:send:email:${normalized}`, SEND_LIMIT_EMAIL, SEND_WINDOW_MS);
    rateLimit(`otp:send:ip:${ip}`, SEND_LIMIT_IP, SEND_WINDOW_MS);
  }

  const [found] = await db
    .select({ id: schema.user.id, emailVerified: schema.user.emailVerified })
    .from(schema.user)
    .where(eq(schema.user.email, normalized))
    .limit(1);

  if (!found) {
    throw new HttpError(400, "Bu e-posta ile kayıtlı hesap bulunamadı.");
  }
  if (found.emailVerified) {
    throw new HttpError(400, "E-posta adresi zaten doğrulanmış.");
  }

  if (!adminBulk) {
    await enforceResendCooldown(normalized, "signup");
  }
  await invalidateActiveOtps(normalized, "signup");

  const code = generateOtpCode();
  const linkToken = generateLinkToken();
  const verifyUrl = buildVerifyEmailUrl(normalized, linkToken);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(schema.emailOtps).values({
    userId: found.id,
    email: normalized,
    otpHash: hashSecret(code),
    purpose: "signup",
    attempts: 0,
    ipAddress: ip === "unknown" ? null : ip,
    expiresAt,
  });
  await storeVerifyLinkToken(normalized, linkToken);

  await sendOtpEmail(normalized, code, "signup", verifyUrl);
  return { verifyUrl };
}

/** OTP doğrula; başarılıysa user + profiles emailVerified günceller. */
export async function verifySignupOtp(
  email: string,
  code: string,
  ip: string,
): Promise<{ userId: string }> {
  const normalized = assertEmail(email);
  const trimmed = code.replace(/\D/g, "");
  if (trimmed.length !== OTP_LENGTH) {
    throw new HttpError(400, "6 haneli kodu girin.");
  }

  rateLimit(`otp:verify:email:${normalized}`, VERIFY_LIMIT_EMAIL, VERIFY_WINDOW_MS);
  rateLimit(`otp:verify:ip:${ip}`, VERIFY_LIMIT_IP, VERIFY_WINDOW_MS);

  const [foundUser] = await db
    .select({ id: schema.user.id, emailVerified: schema.user.emailVerified })
    .from(schema.user)
    .where(eq(schema.user.email, normalized))
    .limit(1);

  if (!foundUser) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod.");
  }
  if (foundUser.emailVerified) {
    return { userId: foundUser.id };
  }

  const [row] = await db
    .select()
    .from(schema.emailOtps)
    .where(
      and(
        eq(schema.emailOtps.email, normalized),
        eq(schema.emailOtps.purpose, "signup"),
        isNull(schema.emailOtps.usedAt),
      ),
    )
    .orderBy(desc(schema.emailOtps.createdAt))
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod.");
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await db
      .update(schema.emailOtps)
      .set({ usedAt: new Date() })
      .where(eq(schema.emailOtps.id, row.id));
    throw new HttpError(400, "Çok fazla hatalı deneme. Yeni kod isteyin.");
  }

  if (!verifySecretHash(trimmed, row.otpHash)) {
    const nextAttempts = row.attempts + 1;
    await db
      .update(schema.emailOtps)
      .set({
        attempts: nextAttempts,
        ...(nextAttempts >= OTP_MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
      })
      .where(eq(schema.emailOtps.id, row.id));

    if (nextAttempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpError(400, "Çok fazla hatalı deneme. Yeni kod isteyin.");
    }
    throw new HttpError(400, "Geçersiz kod.");
  }

  const now = new Date();
  await db.update(schema.emailOtps).set({ usedAt: now }).where(eq(schema.emailOtps.id, row.id));
  await invalidateVerifyLink(normalized);
  await markEmailVerified(foundUser.id);

  return { userId: foundUser.id };
}

/** E-postadaki doğrulama bağlantısı ile üyeliği tamamla. */
export async function verifySignupLink(
  email: string,
  token: string,
  ip: string,
): Promise<{ userId: string }> {
  const normalized = assertEmail(email);
  const trimmed = token.trim();
  if (!trimmed) {
    throw new HttpError(400, "Doğrulama bağlantısı geçersiz.");
  }

  rateLimit(`otp:link:email:${normalized}`, VERIFY_LIMIT_EMAIL, VERIFY_WINDOW_MS);
  rateLimit(`otp:link:ip:${ip}`, VERIFY_LIMIT_IP, VERIFY_WINDOW_MS);

  const [foundUser] = await db
    .select({ id: schema.user.id, emailVerified: schema.user.emailVerified })
    .from(schema.user)
    .where(eq(schema.user.email, normalized))
    .limit(1);

  if (!foundUser) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş bağlantı.");
  }
  if (foundUser.emailVerified) {
    return { userId: foundUser.id };
  }

  const [row] = await db
    .select()
    .from(schema.verification)
    .where(eq(schema.verification.identifier, verifyLinkIdentifier(normalized)))
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    throw new HttpError(400, "Doğrulama bağlantısının süresi dolmuş. Yeni kod isteyin.");
  }

  if (!verifySecretHash(trimmed, row.value)) {
    throw new HttpError(400, "Geçersiz doğrulama bağlantısı.");
  }

  await invalidateVerifyLink(normalized);
  await invalidateActiveOtps(normalized, "signup");
  await markEmailVerified(foundUser.id);

  return { userId: foundUser.id };
}
