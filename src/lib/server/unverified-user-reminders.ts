import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { notify } from "@/lib/server/notify";
import { sendSignupOtp } from "@/lib/server/otp";

export type RemindUnverifiedResult = {
  total: number;
  notified: number;
  emailed: number;
  skipped: number;
  errors: { email: string; error: string }[];
};

/** Doğrulanmamış tüm kullanıcılara site içi bildirim + e-posta (OTP + bağlantı) gönder. */
export async function remindUnverifiedUsers(ip = "admin-bulk"): Promise<RemindUnverifiedResult> {
  const rows = await db
    .select({
      id: schema.user.id,
      email: schema.user.email,
    })
    .from(schema.user)
    .where(eq(schema.user.emailVerified, false));

  const result: RemindUnverifiedResult = {
    total: rows.length,
    notified: 0,
    emailed: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email) {
      result.skipped += 1;
      continue;
    }

    try {
      await notify({
        userId: row.id,
        type: "system",
        title: "E-postanızı doğrulayın",
        body: "Üyeliğinizi tamamlamak için e-posta adresinize gönderilen kodu girin veya doğrulama bağlantısına tıklayın.",
        link: `/verify-email?email=${encodeURIComponent(email)}`,
      });
      result.notified += 1;
    } catch (e) {
      result.errors.push({
        email,
        error: e instanceof Error ? e.message : "Bildirim gönderilemedi",
      });
    }

    try {
      await sendSignupOtp(email, ip, { adminBulk: true });
      result.emailed += 1;
    } catch (e) {
      result.errors.push({
        email,
        error: e instanceof Error ? e.message : "E-posta gönderilemedi",
      });
    }
  }

  return result;
}
