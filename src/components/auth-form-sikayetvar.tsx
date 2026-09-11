import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { cn } from "@/lib/utils";
import type { OAuthProvider } from "@/lib/social-providers-client";

type Props = {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void;
  loading: boolean;
  err: string | null;
  msg: string | null;
  oauthProviders: OAuthProvider[];
  onSocial: (p: OAuthProvider) => void;
  onSubmit: (e: React.FormEvent) => void;
  registerFields?: React.ReactNode;
};

export function SikayetvarAuthShell({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  showPassword,
  setShowPassword,
  loading,
  err,
  msg,
  oauthProviders,
  onSocial,
  onSubmit,
  registerFields,
}: Props) {
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#dfe2eb] px-4 py-10">
      <div className="relative flex w-full max-w-[920px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(39,38,53,0.18)]">
        <Link
          to="/"
          className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full bg-[#eef0f5] text-[#85878e] transition hover:bg-[#e4e7f3]"
          aria-label="Затвори"
        >
          <X className="size-5" />
        </Link>

        <aside className="relative hidden w-[38%] shrink-0 bg-[#eef0f5] md:block">
          <SikayetvarPattern className="absolute inset-0 m-auto h-[88%] w-[88%]" />
        </aside>

        <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-6 flex justify-center">
            <SiteLogoMark size={30} linked tone="on-light" />
          </div>

          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-[#272635]">
              {isLogin ? "Вход" : "Регистрация"}
            </h1>
            <p className="text-[13px] text-[#85878e]">
              {isLogin ? (
                <>
                  Нямате акаунт?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-semibold text-[#272635] underline underline-offset-2"
                  >
                    Регистрирайте се.
                  </button>
                </>
              ) : (
                <>
                  Вече имате акаунт?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-semibold text-[#272635] underline underline-offset-2"
                  >
                    Влезте.
                  </button>
                </>
              )}
            </p>
          </div>

          {err ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {err}
            </div>
          ) : null}
          {msg ? (
            <div className="mb-4 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-[13px] text-brand">
              {msg}
            </div>
          ) : null}

          {oauthProviders.length > 0 && (
            <div className="mb-5 space-y-2.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {oauthProviders.includes("facebook") && (
                  <SocialBtn
                    provider="facebook"
                    onClick={() => onSocial("facebook")}
                    disabled={loading}
                  />
                )}
                {oauthProviders.includes("google") && (
                  <SocialBtn
                    provider="google"
                    onClick={() => onSocial("google")}
                    disabled={loading}
                  />
                )}
              </div>
              {oauthProviders.includes("apple") && (
                <div className="flex justify-center">
                  <SocialBtn
                    provider="apple"
                    onClick={() => onSocial("apple")}
                    disabled={loading}
                    className="w-full max-w-[280px]"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mb-5 h-px bg-[#e4e7f3]" />

          <form className="space-y-4" onSubmit={onSubmit}>
            {registerFields}

            <input
              type="email"
              placeholder="E-mail или телефон"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-[52px] w-full rounded-2xl border border-[#d8dbe8] bg-white px-4 text-[15px] text-[#272635] outline-none transition placeholder:text-[#a0a4b8] focus:border-[#695de9] focus:ring-2 focus:ring-[#695de9]/20"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Парола (мин. 6 символа)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="h-[52px] w-full rounded-2xl border border-[#d8dbe8] bg-white px-4 pr-12 text-[15px] text-[#272635] outline-none transition placeholder:text-[#a0a4b8] focus:border-[#695de9] focus:ring-2 focus:ring-[#695de9]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a0a4b8] hover:text-[#626692]"
                aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer select-none items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-[18px] rounded border-[#d8dbe8] text-[#3ad08f] focus:ring-[#3ad08f]/30"
                  />
                  <span className="text-[14px] text-[#626692]">Запомни ме</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[14px] text-[#85878e] underline underline-offset-2 hover:text-[#272635]"
                >
                  Забравена парола
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#3ad08f] text-[16px] font-bold text-white shadow-sm transition hover:bg-[#42e29d] disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isLogin ? "Вход" : "Регистрация"}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-[#a0a4b8]">
            Продължавайки, приемате{" "}
            <Link
              to="/kullanim-kosullari"
              className="underline hover:text-[#626692]"
            >
              Условията за ползване
            </Link>{" "}
            и{" "}
            <Link to="/gizlilik" className="underline hover:text-[#626692]">
              Политиката за поверителност
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({
  provider,
  onClick,
  disabled,
  className,
}: {
  provider: OAuthProvider;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const cfg = {
    facebook: {
      label: "Вход с Facebook",
      cls: "bg-[#1877F2] text-white hover:brightness-110",
      icon: (
        <svg
          className="size-[18px] shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    google: {
      label: "Вход с Google",
      cls: "bg-[#e04e39] text-white hover:brightness-110",
      icon: (
        <svg className="size-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden>
          <path
            fill="#fff"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
        </svg>
      ),
    },
    apple: {
      label: "Вход с Apple",
      cls: "bg-[#272635] text-white hover:brightness-110",
      icon: (
        <svg
          className="size-[18px] shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      ),
    },
  }[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold transition disabled:opacity-60",
        cfg.cls,
        className,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
}

export function SikayetvarPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 400"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="16" y="16" width="72" height="72" rx="8" fill="#3ad08f" />
      <circle cx="200" cy="52" r="36" fill="#695de9" />
      <rect
        x="248"
        y="16"
        width="56"
        height="56"
        rx="28"
        fill="#b8c4f0"
        opacity="0.9"
      />
      <rect
        x="16"
        y="112"
        width="56"
        height="56"
        rx="28"
        fill="#695de9"
        opacity="0.85"
      />
      <rect
        x="96"
        y="112"
        width="72"
        height="72"
        rx="8"
        fill="#3ad08f"
        opacity="0.75"
      />
      <circle cx="248" cy="148" r="28" fill="#3ad08f" />
      <rect x="16" y="208" width="72" height="72" rx="8" fill="#b8c4f0" />
      <rect
        x="112"
        y="208"
        width="56"
        height="56"
        rx="8"
        fill="#695de9"
        opacity="0.7"
      />
      <circle cx="248" cy="244" r="36" fill="#3ad08f" opacity="0.8" />
      <rect x="16" y="304" width="56" height="56" rx="28" fill="#695de9" />
      <rect
        x="96"
        y="304"
        width="72"
        height="72"
        rx="8"
        fill="#3ad08f"
        opacity="0.6"
      />
      <circle cx="248" cy="340" r="28" fill="#b8c4f0" />
    </svg>
  );
}
