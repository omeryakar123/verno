import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  KeyRound,
  Award,
  CheckCircle2,
  Mail,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import { Messenger } from "@/components/messenger";
import { PhoneInput } from "@/components/phone-input";
import { toE164, fromE164 } from "@/lib/phone";
import { ProfilePageShell } from "@/components/profile/profile-page-shell";
import { ProfileComplaintsList } from "@/components/profile/profile-complaints-list";
import { useProfileData, type Profile } from "@/hooks/use-profile-data";
import { privateHead, SITE_NAME } from "@/lib/seo";
import { UserBadgeGrid, UserBadgeRow } from "@/components/user-badges";
import { cn } from "@/lib/utils";
import type { ProfileAccountSection } from "@/components/profile-account-sidebar";
import { authClient } from "@/lib/auth-client";

const PROFILE_TABS = ["info", "complaints", "supported", "commented", "saved", "messages", "badges", "security"] as const;
type Tab = (typeof PROFILE_TABS)[number];

function parseProfileTab(raw: unknown): Tab {
  if (typeof raw !== "string") return "info";
  if (raw === "mesajlar") return "messages";
  if ((PROFILE_TABS as readonly string[]).includes(raw)) return raw as Tab;
  return "info";
}

const TAB_REDIRECTS: Partial<Record<Tab, string>> = {
  complaints: "/sikayetlerim",
  supported: "/desteklediklerim",
  commented: "/yorumladiklarim",
};

function tabToSection(tab: Tab): ProfileAccountSection {
  if (tab === "info") return "info";
  return tab as ProfileAccountSection;
}

export const Route = createFileRoute("/_site/profile")({
  head: () => privateHead(`Профил — ${SITE_NAME}`, "/profile"),
  validateSearch: (s: Record<string, unknown>): { sekme?: Tab | "mesajlar" } => ({
    sekme: s.sekme !== undefined ? (s.sekme === "mesajlar" ? "mesajlar" : parseProfileTab(s.sekme)) : undefined,
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { sekme } = Route.useSearch();
  const tab = parseProfileTab(sekme);

  useEffect(() => {
    const redirect = TAB_REDIRECTS[tab];
    if (redirect) navigate({ to: redirect, replace: true });
  }, [tab, navigate]);

  const data = useProfileData();
  const [busy, setBusy] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  if (TAB_REDIRECTS[tab]) return null;

  async function patchProfile(body: Partial<Profile & { phone?: string | null }>) {
    if (!data.profile) return false;
    const profile = data.profile;
    const e164 = body.phone !== undefined ? (body.phone ? toE164(body.phone) : null) : profile.phone;
    if (body.phone && !e164) {
      toast.error("Невалиден телефонен номер");
      return false;
    }
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: body.fullName ?? profile.fullName,
        username: body.username ?? profile.username,
        avatarUrl: body.avatarUrl ?? profile.avatarUrl,
        phone: body.phone !== undefined ? e164 : profile.phone,
        city: body.city ?? profile.city,
        bio: body.bio ?? profile.bio,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Запазването не успя");
      return false;
    }
    const resData = (await res.json()) as { profile?: Profile };
    if (resData.profile) {
      data.setProfile(resData.profile);
      data.setPhone(fromE164(resData.profile.phone));
    }
    toast.success("Обновено");
    return true;
  }

  async function sendVerifyEmail() {
    if (!data.email || data.emailVerified) return;
    setVerifySending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Кодът за потвърждение не може да бъде изпратен");
        return;
      }
      toast.success("Кодът за потвърждение е изпратен на имейла ви");
      navigate({ to: "/verify-email", search: { email: data.email, sent: "1" } });
    } finally {
      setVerifySending(false);
    }
  }

  async function changePassword() {
    if (newPw.length < 6) return toast.error("Паролата трябва да е поне 6 символа");
    if (newPw !== newPw2) return toast.error("Паролите не съвпадат");
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: curPw,
      newPassword: newPw,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) toast.error(error.message ?? "Паролата не може да бъде обновена");
    else {
      toast.success("Паролата е обновена");
      setCurPw("");
      setNewPw("");
      setNewPw2("");
    }
  }

  if (!data.loaded) {
    return <ProfilePageShell active={tabToSection(tab)} loading onSignOut={data.logout} />;
  }

  if (!data.profile) {
    return (
      <ProfilePageShell active="info" onSignOut={data.logout}>
        <div className="p-12 text-center text-navy-mid">Профилът не е намерен.</div>
      </ProfilePageShell>
    );
  }

  const strengthItems = [
    { done: data.emailVerified, label: "Потвърдете имейла си", action: !data.emailVerified ? sendVerifyEmail : undefined },
    { done: !!data.profile.avatarUrl, label: "Качете профилна снимка" },
    { done: !!data.profile.phone, label: "Добавете телефонен номер" },
  ];
  const strengthPct = Math.round((strengthItems.filter((i) => i.done).length / strengthItems.length) * 100);

  return (
    <ProfilePageShell active={tabToSection(tab)} onSignOut={data.logout}>
      {tab === "info" && (
        <ProfileInfoPanel
          profile={data.profile}
          email={data.email}
          emailVerified={data.emailVerified}
          phone={data.phone}
          setPhone={data.setPhone}
          badges={data.badges}
          stats={data.stats}
          strengthPct={strengthPct}
          strengthItems={strengthItems}
          verifySending={verifySending}
          busy={busy}
          onPatch={patchProfile}
          onAvatarChange={async (newUrl) => {
            const prev = data.profile!.avatarUrl;
            data.setProfile({ ...data.profile!, avatarUrl: newUrl });
            const ok = await patchProfile({ avatarUrl: newUrl });
            if (!ok) data.setProfile({ ...data.profile!, avatarUrl: prev });
          }}
        />
      )}

      {tab === "badges" && data.badges && (
        <div className="p-6 sm:p-8">
          <SectionTitle icon={Award} title="Моите значки" />
          <UserBadgeGrid earned={data.badges.earned} stats={data.badges.stats} next={data.badges.next} />
        </div>
      )}

      {tab === "saved" && (
        <ProfileComplaintsList complaints={[]} title="Запазени жалби" emptyMessage="Функцията за запазване скоро ще бъде налична." />
      )}

      {tab === "messages" && (
        <div className="p-4 sm:p-6">
          <Messenger />
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-lg p-6 sm:p-8">
          <SectionTitle icon={KeyRound} title="Смяна на парола" />
          <p className="mb-5 text-[13px] text-navy-mid">
            Ако сте влезли с Google, може да нямате парола; в този случай полетата не са активни.
          </p>
          <div className="space-y-4">
            <SecurityField label="Текуща парола" value={curPw} onChange={setCurPw} />
            <SecurityField label="Нова парола" value={newPw} onChange={setNewPw} />
            <SecurityField label="Потвърди новата парола" value={newPw2} onChange={setNewPw2} />
            <button
              type="button"
              onClick={changePassword}
              disabled={busy}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Обнови паролата
            </button>
          </div>
        </div>
      )}
    </ProfilePageShell>
  );
}

function ProfileInfoPanel({
  profile,
  email,
  emailVerified,
  phone,
  setPhone,
  badges,
  stats,
  strengthPct,
  strengthItems,
  verifySending,
  busy,
  onPatch,
  onAvatarChange,
}: {
  profile: Profile;
  email: string;
  emailVerified: boolean;
  phone: string;
  setPhone: (v: string) => void;
  badges: ReturnType<typeof useProfileData>["badges"];
  stats: ReturnType<typeof useProfileData>["stats"];
  strengthPct: number;
  strengthItems: { done: boolean; label: string; action?: () => void }[];
  verifySending: boolean;
  busy: boolean;
  onPatch: (body: Partial<Profile & { phone?: string | null }>) => Promise<boolean>;
  onAvatarChange: (url: string | null) => Promise<void>;
}) {
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col items-center gap-6 pb-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex flex-col items-center gap-4">
          <AvatarUpload url={profile.avatarUrl} userId={profile.id} size={112} onChange={(url) => void onAvatarChange(url)} />
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
              {profile.fullName || email.split("@")[0]}
            </h1>
            <p className="mt-1 truncate text-[14px] text-navy-mid">{email}</p>
            {badges && badges.earned.length > 0 && (
              <div className="mt-3 flex justify-center">
                <UserBadgeRow badges={badges.earned} />
              </div>
            )}
          </div>
        </div>

        <ProfileStrengthCard pct={strengthPct} items={strengthItems} verifySending={verifySending} />
      </div>

      <div className="mb-10 flex border-b border-rule/70 pb-8">
        <StatCell label="Вашите жалби" value={stats.total} />
        <div className="mx-5 w-px bg-gray-300" aria-hidden />
        <StatCell label="Подкрепени" value={stats.supported} />
        <div className="mx-5 w-px bg-gray-300" aria-hidden />
        <StatCell label="Коментари" value={stats.commented} />
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        <RoundedField label="Име и фамилия" value={profile.fullName ?? ""} onSave={(v) => onPatch({ fullName: v })} busy={busy} />
        <RoundedField
          label="Потребителско име"
          value={profile.username ?? ""}
          onSave={(v) => onPatch({ username: v || null })}
          busy={busy}
        />
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[13px] font-semibold text-gray-500">Имейл</span>
            {!emailVerified && (
              <button
                type="button"
                onClick={() => strengthItems[0]?.action?.()}
                disabled={verifySending}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
              >
                {verifySending ? <Loader2 className="size-3 animate-spin" /> : null}
                Потвърди
              </button>
            )}
          </div>
          <div className="flex h-11 items-center gap-3 rounded-full bg-white px-5 ring-1 ring-rule">
            <Mail className="size-4 shrink-0 text-navy-mid" />
            <span className="flex-1 truncate text-[15px] text-gray-400">{email}</span>
            {emailVerified && (
              <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
                Потвърден
              </span>
            )}
          </div>
        </div>
        <RoundedPhoneField
          label="Телефон"
          value={phone}
          onSave={async (v) => {
            setPhone(v);
            return onPatch({ phone: v });
          }}
          busy={busy}
        />
        <div>
          <span className="mb-3 block px-1 text-[13px] font-semibold text-gray-500">Парола</span>
          <div className="flex h-11 items-center rounded-full bg-white px-5 tracking-widest text-gray-400 ring-1 ring-rule">
            ••••••••
          </div>
          <p className="mt-2 px-1 text-[12px] text-navy-mid">
            За смяна на паролата отидете в секцията{" "}
            <Link to="/profile" search={{ sekme: "security" }} className="font-medium text-brand hover:underline">
              Сигурност
            </Link>
            .
          </p>
        </div>
        <RoundedTextArea
          label="За мен"
          value={profile.bio ?? ""}
          onSave={(v) => onPatch({ bio: v || null })}
          busy={busy}
        />
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col justify-between lg:flex-none">
      <div className="text-sm font-medium text-gray-500 xl:text-base">{label}</div>
      <span className="text-lg font-medium text-gray-400 opacity-80 sm:text-2xl">{value.toLocaleString("bg-BG")}</span>
    </div>
  );
}

function ProfileStrengthCard({
  pct,
  items,
  verifySending,
}: {
  pct: number;
  items: { done: boolean; label: string; action?: () => void }[];
  verifySending: boolean;
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl ring-1 ring-rule bg-surface/40 p-5 lg:ml-auto">
      <div className="text-[14px] font-semibold text-ink">
        Силата на профила: <span className="font-bold text-brand">%{pct}</span>
      </div>
      <div className="relative mt-3 flex space-x-1 overflow-hidden rounded-full">
        {items.map((item, i) => (
          <div key={item.label} className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn("absolute inset-y-0 left-0 rounded-full bg-brand transition-all", item.done ? "w-full" : "w-0")}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-[13px]">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                item.done ? "bg-brand text-white" : "bg-rule text-navy-mid",
              )}
            >
              {item.done ? <CheckCircle2 className="size-3.5" /> : <Plus className="size-3.5" />}
            </span>
            {item.action && !item.done ? (
              <button
                type="button"
                onClick={item.action}
                disabled={verifySending}
                className="text-left font-medium text-brand hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span className={item.done ? "text-navy-mid line-through decoration-brand/40" : "text-ink"}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Award; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 text-[16px] font-semibold text-ink">
      <Icon className="size-5 text-brand" />
      {title}
    </div>
  );
}

function RoundedField({
  label,
  value,
  onSave,
  busy,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-gray-500">{label}</span>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold tracking-wide text-brand hover:underline">
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditing(false); setDraft(value); }} className="text-[12px] text-navy-mid">
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => { if (await onSave(draft)) setEditing(false); }}
              className="text-[12px] font-semibold text-brand hover:underline disabled:opacity-50"
            >
              Запази
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-11 w-full rounded-full bg-white px-5 text-[15px] ring-1 ring-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      ) : (
        <div className="flex h-11 w-full items-center rounded-full bg-white px-5 text-gray-400 ring-1 ring-rule">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function RoundedPhoneField({
  label,
  value,
  onSave,
  busy,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-gray-500">{label}</span>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold text-brand hover:underline">
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditing(false); setDraft(value); }} className="text-[12px] text-navy-mid">
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => { if (await onSave(draft)) setEditing(false); }}
              className="text-[12px] font-semibold text-brand hover:underline disabled:opacity-50"
            >
              Запази
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <PhoneInput value={draft} onChange={setDraft} />
      ) : (
        <div className="flex h-11 items-center rounded-full bg-white px-5 text-[15px] text-gray-400 ring-1 ring-rule">
          {value || "Няма добавен телефон"}
        </div>
      )}
    </div>
  );
}

function RoundedTextArea({
  label,
  value,
  onSave,
  busy,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-gray-500">{label}</span>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold text-brand hover:underline">
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditing(false); setDraft(value); }} className="text-[12px] text-navy-mid">
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => { if (await onSave(draft)) setEditing(false); }}
              className="text-[12px] font-semibold text-brand hover:underline disabled:opacity-50"
            >
              Запази
            </button>
          </div>
        )}
      </div>
      <textarea
        value={editing ? draft : value}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={!editing}
        rows={4}
        className={cn(
          "w-full rounded-2xl p-4 text-[15px] ring-1 transition focus:outline-none",
          editing ? "bg-white ring-brand/40 focus:ring-2" : "cursor-default bg-white text-gray-400 ring-rule",
        )}
      />
    </div>
  );
}

function SecurityField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-navy-mid">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-full bg-white px-5 text-[15px] ring-1 ring-rule focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}
