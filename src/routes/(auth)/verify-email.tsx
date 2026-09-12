import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { useAuth, highestRoleRedirect, type AppRole } from "@/hooks/use-auth";
import { OtpInput } from "@/components/otp-input";
import { apiSendSignupOtp, apiVerifySignupLink, apiVerifySignupOtp } from "@/lib/otp-client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { SiteLogoHeader } from "@/components/site-logo-mark";
import { privateHead, SITE_NAME } from "@/lib/seo";

const searchSchema = z.object({
  email: z.string().email().optional(),
  sent: z.enum(["1"]).optional(),
  token: z.string().min(8).optional(),
});

export const Route = createFileRoute("/(auth)/verify-email")({
  head: () => privateHead(`Потвърждение на имейл — ${SITE_NAME}`, "/verify-email"),
  validateSearch: searchSchema,
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email: emailFromQuery, sent, token } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const email = (emailFromQuery ?? user?.email ?? "").toLowerCase();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(sent === "1" ? 60 : 0);
  const [resending, setResending] = useState(false);
  const initialSendRef = useRef(false);
  const linkVerifyRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function finishVerified() {
    setSuccess(true);
    toast.success("Имейлът е потвърден — регистрацията е завършена.");
    setTimeout(async () => {
      await authClient.getSession({ fetchOptions: { cache: "no-store" } });
      const res = await fetch("/api/me", { credentials: "include" });
      const { user: me, roles } = (await res.json()) as { user: unknown; roles: AppRole[] };
      if (me) navigate({ to: highestRoleRedirect(roles) });
      else navigate({ to: "/login" });
    }, 1200);
  }

  useEffect(() => {
    if (!email || !token || linkVerifyRef.current || success) return;
    linkVerifyRef.current = true;
    void (async () => {
      setVerifying(true);
      setErr(null);
      const { error } = await apiVerifySignupLink(email, token);
      setVerifying(false);
      if (error) {
        setErr(error);
        return;
      }
      await finishVerified();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token, success]);

  useEffect(() => {
    if (!email || sent === "1" || token || initialSendRef.current) return;
    initialSendRef.current = true;
    void (async () => {
      const { error } = await apiSendSignupOtp(email);
      if (error) toast.error(error);
      else toast.success("Кодът за потвърждение е изпратен на имейла ви.");
      setCooldown(60);
    })();
  }, [email, sent, token]);

  async function verify(e?: React.FormEvent) {
    e?.preventDefault();
    if (code.length !== 6 || !email) return;
    setVerifying(true);
    setErr(null);
    const { error } = await apiVerifySignupOtp(email, code);
    setVerifying(false);
    if (error) {
      setErr(error);
      return;
    }
    await finishVerified();
  }

  async function resend() {
    if (cooldown > 0 || !email) return;
    setResending(true);
    const { error } = await apiSendSignupOtp(email);
    setResending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Нов код е изпратен.");
    setCode("");
    setCooldown(60);
  }

  useEffect(() => {
    if (code.length === 6 && !verifying && !success) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="min-h-screen bg-canvas grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <SiteLogoHeader />
        <div className="bg-card rounded-2xl ring-1 ring-rule p-7">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto grid place-items-center size-16 rounded-full bg-brand-soft text-brand mb-4 animate-in zoom-in-50">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-xl font-semibold text-ink">Регистрацията е завършена</h1>
              <p className="text-[13px] text-navy-mid mt-1">Имейлът е потвърден. Пренасочване…</p>
            </div>
          ) : (
            <>
              <div className="mx-auto grid place-items-center size-12 rounded-xl bg-brand-soft text-brand mb-4">
                <Mail className="size-5" />
              </div>
              <h1 className="text-xl font-semibold text-ink text-center">Потвърдете имейла си</h1>
              <p className="text-[13px] text-navy-mid mt-1 text-center leading-relaxed">
                {email ? (
                  <>
                    Последна стъпка: въведете 6-цифрения код, изпратен на <b>{email}</b>, или кликнете
                    върху връзката в имейла.
                  </>
                ) : (
                  "Въведете 6-цифрения код от имейла или използвайте връзката за потвърждение."
                )}
              </p>
              {!email && (
                <p className="mt-3 text-center text-[13px]">
                  <Link to="/login" className="text-brand font-medium hover:underline">
                    Влезте в акаунта
                  </Link>
                </p>
              )}
              {err && (
                <div className="mt-4 text-[13px] text-danger bg-danger-soft border border-danger-soft rounded-lg px-3 py-2 text-center">
                  {err}
                </div>
              )}
              {email && (
                <form onSubmit={verify} className="mt-6 space-y-4">
                  <OtpInput value={code} onChange={setCode} disabled={verifying} />
                  <button
                    type="submit"
                    disabled={verifying || code.length !== 6}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-medium h-11 text-sm hover:brightness-110 disabled:opacity-60"
                  >
                    {verifying && <Loader2 className="size-4 animate-spin" />} Потвърди и продължи
                  </button>
                </form>
              )}
              {email && (
                <div className="mt-5 text-center text-[13px] text-navy-mid">
                  {cooldown > 0 ? (
                    <span>
                      Нов код след <b>{cooldown}с</b>
                    </span>
                  ) : (
                    <button
                      onClick={resend}
                      disabled={resending}
                      className="text-brand font-medium hover:underline disabled:opacity-60 inline-flex items-center gap-1"
                    >
                      {resending && <Loader2 className="size-3 animate-spin" />} Изпрати кода отново
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
