import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { highestRoleRedirect, type AppRole } from "@/hooks/use-auth";
import {
  enabledOAuthProviders,
  type OAuthProvider,
} from "@/lib/social-providers-client";
import { apiSendSignupOtp } from "@/lib/otp-client";
import { PhoneInput } from "@/components/phone-input";
import { toE164Tr } from "@/lib/phone";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { SikayetvarAuthShell } from "@/components/auth-form-sikayetvar";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "reset";
type Variant = "user" | "admin" | "brand";

const titles: Record<Variant, { login: string; sub: string; brand: string }> = {
  user: {
    login: "Вход",
    sub: "Следете жалбите си и получавайте официални отговори от марките.",
    brand: "",
  },
  admin: {
    login: "Админ панел",
    sub: "Само за оторизирани администраторски акаунти.",
    brand: "Админ",
  },
  brand: {
    login: "Брандов панел",
    sub: "Влезте с акаунта на представител на марката.",
    brand: "Марка",
  },
};

export function AuthForm({
  variant = "user",
  initialMode = "login",
  corporate = false,
}: {
  variant?: Variant;
  initialMode?: Mode;
  corporate?: boolean;
}) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [companyMessage, setCompanyMessage] = useState("");

  const allowedRolesForVariant: AppRole[] =
    variant === "admin"
      ? ["admin", "super_admin"]
      : variant === "brand"
        ? ["brand"]
        : ["user", "admin", "super_admin", "brand"];

  const oauthProviders = enabledOAuthProviders();

  async function handleSocial(provider: OAuthProvider) {
    setErr(null);
    setLoading(true);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/" });
    } catch (e2: unknown) {
      setErr(
        e2 instanceof Error ? e2.message : `Вход с ${provider} неуспешен.`,
      );
      setLoading(false);
    }
  }

  async function postLoginRedirect() {
    const res = await fetch("/api/me", { credentials: "include" });
    const { roles, user } = (await res.json()) as {
      roles: AppRole[];
      user: { email: string; emailVerified?: boolean } | null;
    };
    if (
      variant !== "user" &&
      !roles.some((r) => allowedRolesForVariant.includes(r))
    ) {
      await authClient.signOut();
      setErr("Нямате достъп до тази страница за вход.");
      return;
    }
    if (variant === "user" && user && !user.emailVerified) {
      const { error: otpErr } = await apiSendSignupOtp(user.email);
      if (otpErr) setErr(otpErr);
      navigate({
        to: "/verify-email",
        search: { email: user.email, sent: otpErr ? undefined : "1" },
      });
      return;
    }
    navigate({ to: highestRoleRedirect(roles) });
  }

  async function finishSignupAndVerify(normalizedEmail: string) {
    const { error: otpErr } = await apiSendSignupOtp(normalizedEmail);
    if (otpErr) {
      setErr(otpErr);
      navigate({ to: "/verify-email", search: { email: normalizedEmail } });
      return;
    }
    setMsg("Акаунтът ви е създаден. Въведете 6-цифрения код от имейла си.");
    navigate({
      to: "/verify-email",
      search: { email: normalizedEmail, sent: "1" },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (mode === "register") {
      if (!fullName.trim()) return setErr("Името и фамилията са задължителни.");
      if (!toE164Tr(phone)) return setErr("Въведете валиден телефонен номер.");
      if (password.length < 6)
        return setErr("Паролата трябва да е поне 6 символа.");
      if (password !== password2) return setErr("Паролите не съвпадат.");
      if (corporate && !companyName.trim())
        return setErr("Името на фирмата е задължително.");
    }
    setLoading(true);
    try {
      if (mode === "register") {
        const e164 = toE164Tr(phone)!;
        const { error } = await authClient.signUp.email({
          email: email.toLowerCase(),
          password,
          name: fullName,
          phone: e164,
        });
        if (error) throw new Error(error.message);
        if (corporate) {
          const corpRes = await fetch("/api/corporate-register", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: companyName.trim(),
              contactName: fullName.trim(),
              email: email.toLowerCase(),
              phone: e164,
              website: companyWebsite.trim() || null,
              brandSlug: brandSlug.trim() || null,
              message: companyMessage.trim() || null,
            }),
          });
          if (!corpRes.ok) {
            const j = (await corpRes.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(
              j.error ?? "Корпоративната заявка не можа да бъде изпратена",
            );
          }
          await finishSignupAndVerify(email.toLowerCase());
          return;
        }
        await finishSignupAndVerify(email.toLowerCase());
        return;
      } else {
        const { error } = await authClient.signIn.email({
          email: email.toLowerCase(),
          password,
          rememberMe: variant === "user" ? rememberMe : undefined,
        });
        if (error) throw new Error(error.message);
        await postLoginRedirect();
      }
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Възникна грешка.");
    } finally {
      setLoading(false);
    }
  }

  const t = titles[variant];
  const isRegister = mode === "register";
  const pageTitle = corporate
    ? "Корпоративна регистрация"
    : isRegister
      ? "Регистрация"
      : t.login;
  const pageSub = corporate
    ? "Регистрирайте се за управление на марка или заявка за собственост."
    : isRegister
      ? "Създайте акаунт за минути и споделете жалбата си."
      : t.sub;
  const brandCopy = getAuthBrandCopy(variant, mode, corporate);

  if (variant === "user" && !corporate) {
    return (
      <SikayetvarAuthShell
        mode={isRegister ? "register" : "login"}
        setMode={(m) => setMode(m)}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        err={err}
        msg={msg}
        oauthProviders={oauthProviders}
        onSocial={handleSocial}
        onSubmit={handleSubmit}
        registerFields={
          isRegister ? (
            <>
              <input
                type="text"
                placeholder="Име и фамилия"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-[52px] w-full rounded-2xl border border-[#d8dbe8] bg-white px-4 text-[15px] text-[#272635] outline-none transition placeholder:text-[#a0a4b8] focus:border-[#695de9] focus:ring-2 focus:ring-[#695de9]/20"
              />
              <div>
                <PhoneInput value={phone} onChange={setPhone} required />
              </div>
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Потвърди парола"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={6}
                  className="h-[52px] w-full rounded-2xl border border-[#d8dbe8] bg-white px-4 pr-12 text-[15px] text-[#272635] outline-none transition placeholder:text-[#a0a4b8] focus:border-[#695de9] focus:ring-2 focus:ring-[#695de9]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a0a4b8]"
                  aria-label="Покажи паролата"
                >
                  {showPassword2 ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col lg:flex-row">
      <AuthBrandPanel
        variant={variant}
        mode={mode}
        corporate={corporate}
        badge={t.brand}
        copy={brandCopy}
      />

      <div className="flex-1 flex flex-col min-h-[100dvh] lg:min-h-0">
        {/* Mobil hero — masaüstündeki sol panelin karşılığı */}
        <MobileAuthHero copy={brandCopy} badge={t.brand} />

        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-rule/60 bg-card/80 backdrop-blur-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-navy-mid hover:text-brand transition-colors"
          >
            <ArrowLeft className="size-4" />
            Начало
          </Link>
          <div className="w-24" aria-hidden />
        </header>

        <main className="flex-1 flex justify-center lg:items-center px-0 sm:px-8 py-0 lg:py-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="auth-form-panel w-full max-w-[420px] lg:px-8 lg:py-8 lg:rounded-2xl lg:shadow-soft px-5 pt-6 sm:pt-8 -mt-7 lg:mt-0 relative z-10 rounded-t-[28px] shadow-[0_-8px_32px_oklch(0.13_0.02_262/0.08)] lg:shadow-soft ring-1 ring-rule/50 pb-8">
            {variant === "user" && !corporate && (
              <div
                className="lg:hidden grid grid-cols-2 gap-1 rounded-xl bg-surface p-1 ring-1 ring-rule mb-6"
                role="tablist"
                aria-label="Вход или регистрация"
              >
                {(["login", "register"] as const).map((tab) => {
                  const active = mode === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMode(tab)}
                      className={cn(
                        "rounded-lg py-2.5 text-[14px] font-semibold transition-colors min-h-11",
                        active
                          ? "bg-brand text-white shadow-sm"
                          : "text-navy-mid hover:text-ink active:bg-brand/10",
                      )}
                    >
                      {tab === "login" ? "Вход" : "Регистрация"}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mb-6 lg:mb-7">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between gap-x-4 gap-y-2">
                <h1 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight text-ink">
                  {pageTitle}
                </h1>
                {variant === "user" && !corporate && (
                  <p className="hidden lg:block text-[13px] text-navy-mid">
                    {isRegister ? (
                      <>
                        Вече имате акаунт?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-brand font-semibold hover:underline"
                        >
                          Влезте
                        </button>
                      </>
                    ) : (
                      <>
                        Нямате акаунт?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("register")}
                          className="text-brand font-semibold hover:underline"
                        >
                          Регистрирайте се
                        </button>
                      </>
                    )}
                  </p>
                )}
              </div>
              <p className="mt-2 text-[14px] text-navy-mid leading-relaxed">
                {pageSub}
              </p>
            </div>

            {err && (
              <div className="mb-4 text-[13px] text-danger bg-danger-soft border border-danger/20 rounded-xl px-4 py-3">
                {err}
              </div>
            )}
            {msg && (
              <div className="mb-4 text-[13px] text-brand bg-brand-soft border border-brand/20 rounded-xl px-4 py-3">
                {msg}
              </div>
            )}

            {variant === "user" && oauthProviders.length > 0 && !corporate && (
              <div className="space-y-2.5 mb-6">
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
                  {oauthProviders.includes("facebook") && (
                    <SocialButton
                      provider="facebook"
                      onClick={() => handleSocial("facebook")}
                      disabled={loading}
                      compact
                    />
                  )}
                  {oauthProviders.includes("google") && (
                    <SocialButton
                      provider="google"
                      onClick={() => handleSocial("google")}
                      disabled={loading}
                      compact
                    />
                  )}
                </div>
                {oauthProviders.includes("apple") && (
                  <SocialButton
                    provider="apple"
                    onClick={() => handleSocial("apple")}
                    disabled={loading}
                  />
                )}
                <div className="flex items-center gap-3 pt-1 text-[11px] uppercase tracking-wider text-navy-mid font-medium">
                  <div className="h-px bg-rule flex-1" />
                  <span>с имейл</span>
                  <div className="h-px bg-rule flex-1" />
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <Field
                  icon={UserIcon}
                  label="Име и фамилия"
                  type="text"
                  placeholder="Вашето име и фамилия"
                  value={fullName}
                  onChange={setFullName}
                  required
                />
              )}
              <Field
                icon={Mail}
                label="Имейл"
                type="email"
                placeholder="primer@email.bg"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
              />
              {isRegister && (
                <div>
                  <label className="text-[12px] font-semibold text-navy-mid mb-1.5 block">
                    Телефон
                  </label>
                  <PhoneInput value={phone} onChange={setPhone} required />
                </div>
              )}
              <Field
                icon={Lock}
                label="Парола"
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "Поне 6 символа" : "Вашата парола"}
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-navy-mid hover:text-ink transition-colors p-1"
                    aria-label={
                      showPassword ? "Скрий паролата" : "Покажи паролата"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />
              {isRegister && (
                <Field
                  icon={Lock}
                  label="Потвърди парола"
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Въведете паролата отново"
                  value={password2}
                  onChange={setPassword2}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword2((v) => !v)}
                      className="text-navy-mid hover:text-ink transition-colors p-1"
                      aria-label={
                        showPassword2 ? "Скрий паролата" : "Покажи паролата"
                      }
                    >
                      {showPassword2 ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  }
                />
              )}
              {isRegister && corporate && (
                <div className="space-y-4 pt-1 border-t border-rule/60">
                  <Field
                    icon={Building2}
                    label="Име на фирмата"
                    type="text"
                    placeholder="Име на вашата фирма"
                    value={companyName}
                    onChange={setCompanyName}
                    required
                  />
                  <Field
                    icon={Building2}
                    label="Уебсайт"
                    type="text"
                    placeholder="https://"
                    value={companyWebsite}
                    onChange={setCompanyWebsite}
                  />
                  <Field
                    icon={Building2}
                    label="Slug на марката (по избор)"
                    type="text"
                    placeholder="primer-marka"
                    value={brandSlug}
                    onChange={setBrandSlug}
                  />
                  <div>
                    <label className="text-[12px] font-semibold text-navy-mid mb-1.5 block">
                      Вашето съобщение
                    </label>
                    <textarea
                      value={companyMessage}
                      onChange={(e) => setCompanyMessage(e.target.value)}
                      placeholder="Заявка за упълномощаване или бележка"
                      rows={3}
                      className="w-full rounded-xl ring-1 ring-rule bg-card px-4 py-3 text-sm text-ink placeholder:text-navy-mid focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none transition"
                    />
                  </div>
                </div>
              )}

              {!isRegister && variant === "user" && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 -mt-1">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none min-h-11">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-[18px] rounded border-rule text-brand focus:ring-brand/40"
                    />
                    <span className="text-[14px] text-navy-mid">
                      Запомни ме
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[14px] font-medium text-brand hover:underline min-h-11 inline-flex items-center"
                  >
                    Забравена парола
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-semibold h-[52px] text-[16px] shadow-sm hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 mt-2 lg:h-12 lg:text-[15px]"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {isRegister
                  ? corporate
                    ? "Регистрация и изпращане"
                    : "Регистрация"
                  : "Вход"}
              </button>
            </form>

            {variant === "user" && !corporate && isRegister && (
              <p className="mt-6 text-center text-[13px] text-navy-mid">
                Представител на марка?{" "}
                <Link
                  to="/register/marka-basvuru"
                  className="text-brand font-semibold hover:underline"
                >
                  Кандидатствай като марка
                </Link>
              </p>
            )}

            <p className="mt-8 text-center text-[11px] text-navy-mid/80 leading-relaxed">
              Продължавайки, приемате{" "}
              <Link
                to="/kullanim-kosullari"
                className="underline hover:text-ink"
              >
                Условията за ползване
              </Link>{" "}
              и{" "}
              <Link to="/gizlilik" className="underline hover:text-ink">
                Политиката за поверителност
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

type AuthBrandCopy = {
  headline: string;
  sub: string;
  features: { icon: typeof MessageSquare; text: string }[];
};

function getAuthBrandCopy(
  variant: Variant,
  mode: Mode,
  corporate: boolean,
): AuthBrandCopy {
  const isRegister = mode === "register";
  const headline =
    variant === "admin"
      ? "Административен център"
      : variant === "brand"
        ? "Брандов панел"
        : corporate
          ? "Корпоративен партньор"
          : isRegister
            ? "Присъединете се"
            : "Добре дошли отново";

  const sub =
    variant === "user" && !corporate
      ? "Независимата българска платформа за жалби — получавайте официални отговори от марките."
      : variant === "brand"
        ? "Управлявайте жалбите и отговаряйте бързо на клиентите си."
        : "Продължете със сигурна и криптирана сесия.";

  const features =
    variant === "user" && !corporate
      ? [
          { icon: MessageSquare, text: "Напишете жалба и следете процеса" },
          { icon: ShieldCheck, text: "Потвърдени отговори от марки" },
          { icon: TrendingUp, text: "Открийте trending марки" },
        ]
      : variant === "brand"
        ? [
            { icon: MessageSquare, text: "Отговаряйте бързо на жалби" },
            { icon: ShieldCheck, text: "Верифициран брандов профил" },
          ]
        : [];

  return { headline, sub, features };
}

function MobileAuthHero({
  copy,
  badge,
}: {
  copy: AuthBrandCopy;
  badge: string;
}) {
  return (
    <section className="relative lg:hidden overflow-hidden bg-media text-media-foreground shrink-0">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-16 -right-10 size-48 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-56 rounded-full bg-accent-purple/25 blur-3xl" />
        <AuthPattern className="right-4 top-8 w-[180px] h-[180px] opacity-25" />
      </div>

      <div className="relative z-10 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] font-medium text-white/90 ring-1 ring-white/15 active:bg-white/15 transition-colors min-h-10"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Начало
          </Link>
          <SiteLogoMark size={22} linked tone="on-dark" />
        </div>

        {badge ? (
          <span className="mb-3 inline-flex text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/90 px-2.5 py-1 rounded-full ring-1 ring-white/15">
            {badge}
          </span>
        ) : null}

        <h2 className="font-display text-[26px] font-bold leading-[1.15] tracking-tight text-white max-w-[18ch]">
          {copy.headline}
        </h2>
        <p className="mt-2 text-[14px] text-white/72 leading-relaxed max-w-[34ch]">
          {copy.sub}
        </p>

        {copy.features.length > 0 && (
          <ul className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
            {copy.features.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="snap-start shrink-0 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[12px] text-white/90 ring-1 ring-white/10 max-w-[220px]"
              >
                <Icon className="size-4 text-brand shrink-0" />
                <span className="leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AuthBrandPanel({
  badge,
  copy,
}: {
  variant: Variant;
  mode: Mode;
  corporate: boolean;
  badge: string;
  copy: AuthBrandCopy;
}) {
  return (
    <aside className="relative hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between overflow-hidden bg-media text-media-foreground p-10 xl:p-12">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-accent-purple/20 blur-3xl" />
        <AuthPattern />
      </div>

      <div className="relative z-10">
        <SiteLogoMark size={26} linked tone="on-dark" />
        {badge ? (
          <span className="mt-4 inline-flex text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/90 px-2.5 py-1 rounded-full ring-1 ring-white/15">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 space-y-6 max-w-md">
        <div>
          <h2 className="font-display text-[32px] xl:text-[36px] font-bold leading-[1.12] tracking-tight text-white">
            {copy.headline}
          </h2>
          <p className="mt-3 text-[15px] text-white/70 leading-relaxed">
            {copy.sub}
          </p>
        </div>

        {copy.features.length > 0 && (
          <ul className="space-y-3">
            {copy.features.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-[14px] text-white/85"
              >
                <span className="grid place-items-center size-9 rounded-lg bg-white/10 ring-1 ring-white/10 shrink-0">
                  <Icon className="size-4 text-brand" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="relative z-10 text-[12px] text-white/45">
        © {new Date().getFullYear()} verno.bg — Independent complaint platform
      </p>
    </aside>
  );
}

function AuthPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "absolute right-8 top-1/2 -translate-y-1/2 w-[280px] h-[280px] opacity-[0.35]",
        className,
      )}
      viewBox="0 0 200 200"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="56"
        height="56"
        rx="12"
        fill="oklch(0.76 0.15 162 / 0.5)"
      />
      <rect
        x="72"
        y="8"
        width="56"
        height="56"
        rx="28"
        fill="oklch(0.72 0.16 285 / 0.45)"
      />
      <rect
        x="136"
        y="8"
        width="56"
        height="56"
        rx="8"
        fill="white"
        fillOpacity="0.12"
      />
      <rect
        x="8"
        y="72"
        width="56"
        height="56"
        rx="28"
        fill="white"
        fillOpacity="0.08"
      />
      <rect
        x="72"
        y="72"
        width="56"
        height="56"
        rx="12"
        fill="oklch(0.76 0.15 162 / 0.35)"
      />
      <rect
        x="136"
        y="72"
        width="56"
        height="56"
        rx="28"
        fill="oklch(0.72 0.16 285 / 0.4)"
      />
      <rect
        x="8"
        y="136"
        width="56"
        height="56"
        rx="8"
        fill="oklch(0.72 0.16 285 / 0.3)"
      />
      <rect
        x="72"
        y="136"
        width="56"
        height="56"
        rx="12"
        fill="white"
        fillOpacity="0.1"
      />
      <circle cx="164" cy="164" r="28" fill="oklch(0.76 0.15 162 / 0.45)" />
    </svg>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  trailing,
}: {
  icon: typeof Mail;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-navy-mid mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[18px] text-navy-mid/80 pointer-events-none" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full h-[52px] lg:h-12 rounded-xl ring-1 ring-rule bg-card pl-11 pr-11 text-[16px] lg:text-[15px] text-ink placeholder:text-navy-mid/70 focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
        />
        {trailing && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialButton({
  provider,
  onClick,
  disabled,
  compact,
}: {
  provider: OAuthProvider;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const styles: Record<OAuthProvider, string> = {
    google:
      "bg-surface text-ink ring-1 ring-rule hover:bg-[oklch(0.96_0.004_250)]",
    facebook:
      "bg-[#1877F2] text-white hover:brightness-110 ring-1 ring-[#1877F2]",
    apple: "bg-ink text-white hover:brightness-110 ring-1 ring-ink/20",
  };

  const labels: Record<OAuthProvider, string> = {
    google: compact ? "Google" : "Продължи с Google",
    facebook: compact ? "Facebook" : "Продължи с Facebook",
    apple: "Продължи с Apple",
  };

  const icons: Record<OAuthProvider, React.ReactNode> = {
    google: <GoogleIcon />,
    facebook: <FacebookIcon />,
    apple: <AppleIcon />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 rounded-xl h-12 text-[14px] font-semibold transition disabled:opacity-60 active:scale-[0.99]",
        styles[provider],
      )}
    >
      {icons[provider]}
      {labels[provider]}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5c-1.9 1.3-4.4 2.2-7.2 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.3 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.4l6.1 5c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
