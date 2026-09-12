import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OtpInput } from "@/components/otp-input";
import { toast } from "sonner";
import { SiteLogoHeader } from "@/components/site-logo-mark";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => privateHead(`Забравена парола — ${SITE_NAME}`, "/forgot-password"),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "verify" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await authClient.forgetPassword.emailOtp({ email: email.toLowerCase() });
    setLoading(false);
    if (error) {
      setErr(error.message ?? "Не може да се изпрати");
      return;
    }
    toast.success("Ако имейлът е регистриран, кодът е изпратен.");
    setStep("verify");
    setCooldown(60);
    setCode("");
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setErr("Въведете 6-цифрен код.");
    if (password.length < 6) return setErr("Паролата трябва да е поне 6 символа.");
    setLoading(true);
    setErr(null);
    const { error } = await authClient.emailOtp.resetPassword({
      email: email.toLowerCase(),
      otp: code,
      password,
    });
    setLoading(false);
    if (error) {
      setErr(error.message ?? "Не може да се нулира");
      return;
    }
    setStep("done");
    setTimeout(() => navigate({ to: "/login" }), 1500);
  }

  return (
    <div className="min-h-screen bg-canvas grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <SiteLogoHeader />
        <div className="bg-card rounded-2xl ring-1 ring-rule p-7">
          {step === "done" ? (
            <div className="text-center py-6">
              <div className="mx-auto grid place-items-center size-16 rounded-full bg-brand-soft text-brand mb-4">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-xl font-semibold text-ink">Паролата е обновена</h1>
              <p className="text-[13px] text-navy-mid mt-1">Пренасочване към входа…</p>
            </div>
          ) : step === "email" ? (
            <>
              <h1 className="text-xl font-semibold text-ink">Забравена парола</h1>
              <p className="text-[13px] text-navy-mid mt-1">
                Ще изпратим 6-цифрен код за потвърждение на имейла ви.
              </p>
              {err && (
                <div className="mt-4 text-[13px] text-danger bg-danger-soft border border-danger-soft rounded-lg px-3 py-2">
                  {err}
                </div>
              )}
              <form onSubmit={requestCode} className="mt-5 space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-navy-mid" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Имейл"
                    className="w-full h-11 rounded-lg ring-1 ring-rule bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-medium h-11 text-sm hover:brightness-110 disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />} Изпрати код
                </button>
              </form>
              <div className="mt-5 text-[13px] text-navy-mid text-center">
                <Link to="/login" className="hover:text-ink">
                  ← Към входа
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-ink">Нова парола</h1>
              <p className="text-[13px] text-navy-mid mt-1">
                Въведете кода, изпратен на <b>{email}</b>.
              </p>
              {err && (
                <div className="mt-4 text-[13px] text-danger bg-danger-soft border border-danger-soft rounded-lg px-3 py-2">
                  {err}
                </div>
              )}
              <form onSubmit={submitReset} className="mt-5 space-y-4">
                <OtpInput value={code} onChange={setCode} disabled={loading} />
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-navy-mid" />
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Нова парола (мин. 6)"
                    className="w-full h-11 rounded-lg ring-1 ring-rule bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <button
                  disabled={loading || code.length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-medium h-11 text-sm hover:brightness-110 disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />} Обнови паролата
                </button>
              </form>
              <div className="mt-5 text-center text-[13px] text-navy-mid">
                {cooldown > 0 ? (
                  <span>
                    Нов код след <b>{cooldown}с</b>
                  </span>
                ) : (
                  <button
                    onClick={() => requestCode()}
                    disabled={loading}
                    className="text-brand font-medium hover:underline disabled:opacity-60"
                  >
                    Изпрати кода отново
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
