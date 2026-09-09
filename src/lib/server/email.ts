/** OTP / transactional e-posta — Resend API (öncelik) veya SMTP yedek. */

import nodemailer from "nodemailer";

export function resolveFromAddress(): string {
  const explicit = process.env.SMTP_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim();
  if (explicit) {
    return explicit.includes("<") ? explicit : `tepkimvar <${explicit}>`;
  }
  return process.env.EMAIL_FROM || "tepkimvar <info@tepkimvar.net>";
}

function parseFrom(raw: string): { name?: string; address: string } {
  const m = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim(), address: m[2].trim() };
  return { address: raw.trim() };
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_PASSWORD?.trim());
}

function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function emailProvider(): "resend" | "smtp" | "auto" {
  const p = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (p === "resend") return "resend";
  if (p === "smtp") return "smtp";
  return "auto";
}

/** Prod'da SMTP/Resend yoksa sessiz başarı yerine hata fırlat. */
export function assertEmailConfigured(): void {
  const provider = emailProvider();
  if (provider === "resend" && resendConfigured()) return;
  if (provider === "smtp" && smtpConfigured()) return;
  if (provider === "auto" && (resendConfigured() || smtpConfigured())) return;
  if (process.env.EMAIL_DEV_CONSOLE === "true") return;
  throw new Error(
    "E-posta servisi yapılandırılmamış. Coolify'da RESEND_API_KEY ve RESEND_FROM_EMAIL ayarlayın.",
  );
}

function otpSubject(type: "signup" | "forget-password"): string {
  return type === "forget-password" ? "Şifre sıfırlama kodun — tepkimvar" : "E-posta doğrulama kodun — tepkimvar";
}

function otpHtml(
  otp: string,
  type: "signup" | "forget-password",
  verifyUrl?: string | null,
): string {
  const lead =
    type === "forget-password"
      ? "Şifrenizi sıfırlamak için aşağıdaki kodu girin:"
      : "Kaydınızı tamamlamak için e-posta adresinizi doğrulayın:";
  const linkBlock =
    type === "signup" && verifyUrl
      ? `<p style="margin:28px 0 0;text-align:center">
    <a href="${verifyUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px">E-postamı doğrula</a>
  </p>
  <p style="margin:16px 0 0;font-size:12px;color:#64748b;text-align:center;word-break:break-all">Bağlantı çalışmazsa: ${verifyUrl}</p>`
      : "";
  return `<!DOCTYPE html>
<html lang="tr">
<body style="font-family:Inter,Segoe UI,sans-serif;background:#f4f6f8;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">tepkimvar</p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">Doğrulama kodun</h1>
    <p style="margin:0 0 24px;color:#334155;line-height:1.5">${lead}</p>
    <p style="margin:0 0 8px;font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;text-align:center">${otp}</p>
    ${linkBlock}
    <p style="margin:24px 0 0;font-size:13px;color:#64748b;text-align:center">Kod 10 dakika geçerlidir. Bağlantı 24 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>
  </div>
</body>
</html>`;
}

async function sendViaSmtp(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user =
    process.env.SMTP_USER?.trim() ||
    process.env.SMTP_LOGIN?.trim() ||
    parseFrom(resolveFromAddress()).address;
  if (!user) {
    throw new Error("SMTP_USER tanımlı değil (Brevo panelindeki SMTP login e-postası).");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: process.env.SMTP_PASSWORD!.trim(),
    },
  });

  const from = parseFrom(resolveFromAddress());
  await transporter.sendMail({
    from: from.name ? `"${from.name}" <${from.address}>` : from.address,
    to,
    subject,
    html,
  });
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY!.trim();
  const from = resolveFromAddress();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[Resend] OTP gönderilemedi (${res.status}) from="${from}" to="${to}": ${detail}`);
    throw new Error("E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.");
  }
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  type: "signup" | "forget-password",
  verifyUrl?: string | null,
): Promise<void> {
  assertEmailConfigured();
  const subject = otpSubject(type);
  const html = otpHtml(otp, type, verifyUrl);

  const provider = emailProvider();
  const tryResendFirst = provider === "resend" || (provider === "auto" && resendConfigured());

  if (tryResendFirst && resendConfigured()) {
    try {
      await sendViaResend(email, subject, html);
      return;
    } catch (e) {
      if (provider === "resend" || !smtpConfigured()) throw e;
      console.error("[Resend] OTP gönderilemedi, SMTP deneniyor:", e);
    }
  }

  if (smtpConfigured()) {
    try {
      await sendViaSmtp(email, subject, html);
      return;
    } catch (e) {
      console.error("[SMTP] OTP gönderilemedi:", e);
      throw new Error("E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  }

  if (!tryResendFirst && resendConfigured()) {
    await sendViaResend(email, subject, html);
    return;
  }

  console.log(`[OTP:${type}] ${email} -> ${otp}${verifyUrl ? ` link=${verifyUrl}` : ""}`);
}
