import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Mail, Lock, User as UserIcon, Building2, MapPin, Camera, Upload } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { PhoneInput } from "@/components/phone-input";
import { toE164Tr } from "@/lib/phone";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";
import { SiteLogoMark } from "@/components/site-logo-mark";

export function BrandApplicationForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loggedIn = Boolean(session?.user);

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.email) setEmail(session.user.email);
    if (session.user.name) setFullName(session.user.name);
  }, [session?.user]);

  function onPhotoChange(file: File | null) {
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!fullName.trim()) return setErr("Името е задължително.");
    if (!loggedIn && !email.trim()) return setErr("Имейлът е задължителен.");
    if (!toE164Tr(phone)) return setErr("Въведете валиден телефонен номер.");
    if (!loggedIn) {
      if (password.length < 6) return setErr("Паролата трябва да е поне 6 символа.");
      if (password !== password2) return setErr("Паролите не съвпадат.");
    }
    if (!brandName.trim()) return setErr("Името на марката е задължително.");
    if (!address.trim() || address.trim().length < 10) {
      return setErr("Адресът трябва да е поне 10 символа.");
    }
    if (!photoFile) return setErr("Качете снимка за потвърждение.");

    setLoading(true);
    try {
      const e164 = toE164Tr(phone)!;
      const normalizedEmail = (loggedIn ? session!.user.email : email).toLowerCase();

      if (!session?.user) {
        const { error } = await authClient.signUp.email({
          email: normalizedEmail,
          password,
          name: fullName,
          phone: e164,
        });
        if (error) {
          const message = error.message ?? "";
          if (/already|exists|kayıtlı|mevcut/i.test(message)) {
            throw new Error("Този имейл вече е регистриран. Влезте и опитайте отново.");
          }
          throw new Error(message || "Акаунтът не можа да бъде създаден");
        }
      }

      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
      uploadForm.append("folder", "brand-application-photos");
      const upRes = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: uploadForm,
      });
      if (!upRes.ok) {
        const j = (await upRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Качването на снимката не бе успешно");
      }
      const { url: photoUrl } = (await upRes.json()) as { url: string };

      const appRes = await fetch("/api/brand-application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          contactName: fullName.trim(),
          email: normalizedEmail,
          phone: e164,
          address: address.trim(),
          photoUrl,
          website: website.trim() || null,
        }),
      });
      if (!appRes.ok) {
        const j = (await appRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Заявката не можа да бъде изпратена");
      }

      setMsg(
        "Заявката е получена. След одобрение данните за вход ще бъдат изпратени на имейла ви.",
      );
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Възникна грешка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-theme="light"
      className="relative isolate min-h-screen overflow-hidden bg-[#F4F6FB] px-4 py-12"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-primary/15" aria-hidden />
      <div className="pointer-events-none absolute right-[-40px] top-24 size-32 rounded-full bg-brand/25" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 left-[20%] size-16 rounded-full bg-[#F5D76E]/70" aria-hidden />

      <div className="relative mx-auto w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <SiteLogoMark size={30} linked tone="on-light" />
        </div>

        <div className="rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(39,38,53,0.12)] sm:p-8">
          <p className="text-sm font-semibold text-brand">Марки</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#10141F]">
            Заявка за марка
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#4a5168]">
            Кандидатствайте за достъп до панела за управление. След одобрение данните
            за вход се изпращат на имейла ви. Контакт: {SITE_CONTACT_EMAIL}
          </p>

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {err}
            </div>
          )}
          {msg && (
            <div className="mt-4 rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand">
              {msg}
            </div>
          )}

          {!msg && (
            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7a8196]">
                Данни за акаунт
              </div>
              <Field icon={UserIcon} type="text" placeholder="Име и фамилия *" value={fullName} onChange={setFullName} required />
              <Field
                icon={Mail}
                type="email"
                placeholder="Имейл (за вход) *"
                value={email}
                onChange={setEmail}
                required
                readOnly={loggedIn}
              />
              <PhoneInput value={phone} onChange={setPhone} required />
              {!loggedIn && (
                <>
                  <Field icon={Lock} type="password" placeholder="Парола *" value={password} onChange={setPassword} required minLength={6} />
                  <Field icon={Lock} type="password" placeholder="Потвърди парола *" value={password2} onChange={setPassword2} required minLength={6} />
                </>
              )}

              <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-[#7a8196]">
                Данни за марката
              </div>
              <Field icon={Building2} type="text" placeholder="Име на марката *" value={brandName} onChange={setBrandName} required />
              <Field icon={Building2} type="text" placeholder="Уебсайт (по желание)" value={website} onChange={setWebsite} />
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-[#7a8196]" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Служебен адрес *"
                  rows={3}
                  required
                  className="w-full resize-none rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm text-[#10141F] ring-1 ring-[#d8dbe8] placeholder:text-[#a0a4b8] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#4a5168]">
                  Снимка за потвърждение (телефон / документ) *
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1.5 flex w-full items-center gap-3 rounded-xl bg-[#F4F6FB] px-4 py-3 text-left ring-1 ring-[#d8dbe8] transition hover:bg-[#eef1f8]"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="size-12 rounded-lg object-cover" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-lg bg-white text-[#7a8196]">
                      <Camera className="size-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[#10141F]">
                      {photoFile?.name ?? "Изберете снимка"}
                    </span>
                    <span className="text-[11px] text-[#7a8196]">JPG, PNG или WebP — до 10 MB</span>
                  </span>
                  <Upload className="size-4 shrink-0 text-brand" />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white shadow-[0_10px_24px_rgb(30_201_184/0.32)] transition hover:bg-brand-hover disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Изпрати заявката
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-[13px] text-[#7a8196]">
            Вече имате акаунт?{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">Вход</Link>
            {" · "}
            <Link to="/register" className="font-medium text-brand hover:underline">Лична регистрация</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, type, placeholder, value, onChange, required, minLength, readOnly,
}: {
  icon: typeof Mail; type: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number; readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8196]" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        readOnly={readOnly}
        className={`h-12 w-full rounded-xl bg-white pl-10 pr-3 text-sm text-[#10141F] ring-1 ring-[#d8dbe8] placeholder:text-[#a0a4b8] transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${readOnly ? "cursor-default opacity-70" : ""}`}
      />
    </div>
  );
}
