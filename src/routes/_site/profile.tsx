import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  KeyRound,
  MessageSquare,
  Eye,
  CheckCircle2,
  Mail,
  Award,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import { Messenger } from "@/components/messenger";
import { PhoneInput } from "@/components/phone-input";
import { toE164, fromE164 } from "@/lib/phone";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE } from "@/lib/data";
import { complaintLinkId } from "@/lib/complaint-link";
import { dbStatusToUi, statusLabel, statusClasses } from "@/lib/complaint-status";
import { privateHead, SITE_NAME } from "@/lib/seo";
import { UserBadgeGrid, UserBadgeRow } from "@/components/user-badges";
import type { UserBadgePayload } from "@/lib/server/user-badges";
import { cn } from "@/lib/utils";
import { ProfileAccountSidebar, type ProfileAccountSection } from "@/components/profile-account-sidebar";

const PROFILE_TABS = ["info", "complaints", "supported", "commented", "saved", "messages", "badges", "security"] as const;
type Tab = (typeof PROFILE_TABS)[number];

function parseProfileTab(raw: unknown): Tab {
  if (typeof raw !== "string") return "info";
  if (raw === "mesajlar") return "messages";
  if ((PROFILE_TABS as readonly string[]).includes(raw)) return raw as Tab;
  return "info";
}

export const Route = createFileRoute("/_site/profile")({
  head: () => privateHead(`Профил — ${SITE_NAME}`, "/profile"),
  validateSearch: (s: Record<string, unknown>): { sekme?: Tab | "mesajlar" } => ({
    sekme: s.sekme !== undefined ? (s.sekme === "mesajlar" ? "mesajlar" : parseProfileTab(s.sekme)) : undefined,
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
};

type Complaint = {
  id: string;
  publicId: string | null;
  title: string;
  status: string;
  views: number;
  createdAt: string;
};

const NAV: { id: Tab; label: string }[] = [
  { id: "info", label: "Редактирай профила" },
  { id: "complaints", label: "Моите жалби" },
  { id: "supported", label: "Подкрепени" },
  { id: "commented", label: "Коментирани" },
  { id: "saved", label: "Запазени" },
  { id: "messages", label: "Съобщения" },
  { id: "badges", label: "Значки" },
  { id: "security", label: "Сигурност" },
];

function tabSearchParam(id: Tab): { sekme?: Tab | "mesajlar" } {
  if (id === "info") return {};
  if (id === "messages") return { sekme: "mesajlar" };
  return { sekme: id };
}

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [badges, setBadges] = useState<UserBadgePayload | null>(null);
  const [verifySending, setVerifySending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const { sekme } = Route.useSearch();
  const [tab, setTab] = useState<Tab>(() => parseProfileTab(sekme));
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [supported, setSupported] = useState<Complaint[]>([]);
  const [commented, setCommented] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    views: 0,
    follows: 0,
  });
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    setTab(parseProfileTab(sekme));
  }, [sekme]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = (await res.json()) as {
          profile: Profile | null;
          email: string;
          emailVerified: boolean;
          badges?: UserBadgePayload;
        };
        if (data.profile) {
          setProfile(data.profile);
          setPhone(fromE164(data.profile.phone));
        }
        setEmail(data.email ?? "");
        setEmailVerified(!!data.emailVerified);
        if (data.badges) setBadges(data.badges);

        const [cres, sres, cmres] = await Promise.all([
          fetch("/api/me/complaints", { credentials: "include" }),
          fetch("/api/me/supported", { credentials: "include" }),
          fetch("/api/me/commented", { credentials: "include" }),
        ]);
        const cjson = (await cres.json()) as { complaints: Complaint[] };
        const sjson = (await sres.json()) as { complaints: Complaint[] };
        const cmjson = (await cmres.json()) as { complaints: Complaint[] };
        const list = cjson.complaints ?? [];
        setComplaints(list);
        setSupported(sjson.complaints ?? []);
        setCommented(cmjson.complaints ?? []);
        setStats({
          total: list.length,
          resolved: list.filter((c) => dbStatusToUi(c.status) === "cozuldu").length,
          views: list.reduce((s, c) => s + (c.views ?? 0), 0),
          follows: 0,
        });

        fetch("/api/me/follows", { credentials: "include" })
          .then((r) => (r.ok ? r.json() : { count: 0 }))
          .then((j: { count?: number }) => {
            setStats((s) => ({ ...s, follows: j.count ?? 0 }));
          })
          .catch(() => {});
      } catch {
        toast.error("Профилът не може да се зареди");
      } finally {
        setLoaded(true);
      }
    })();
  }, [user]);

  async function patchProfile(body: Partial<Profile & { phone?: string | null }>) {
    if (!profile) return false;
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
    const data = (await res.json()) as { profile?: Profile };
    if (data.profile) {
      setProfile(data.profile);
      setPhone(fromE164(data.profile.phone));
    }
    toast.success("Обновено");
    return true;
  }

  async function sendVerifyEmail() {
    if (!email || emailVerified) return;
    setVerifySending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Кодът за потвърждение не може да бъде изпратен");
        return;
      }
      toast.success("Кодът за потвърждение е изпратен на имейла ви");
      navigate({ to: "/verify-email", search: { email, sent: "1" } });
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

  async function logout() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  if (authLoading || !loaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-navy-mid">
        <Loader2 className="mx-auto size-7 animate-spin" />
        <p className="mt-3 text-[14px]">Зареждане на профила…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-navy-mid">
        Профилът не е намерен.
      </div>
    );
  }

  const strengthItems = [
    { done: emailVerified, label: "Потвърдете имейла си", action: !emailVerified ? sendVerifyEmail : undefined },
    { done: !!profile.avatarUrl, label: "Качете профилна снимка" },
    { done: !!profile.phone, label: "Добавете телефонен номер" },
  ];
  const strengthPct = Math.round((strengthItems.filter((i) => i.done).length / strengthItems.length) * 100);

  return (
    <div className="bg-surface/80 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:w-[260px] shrink-0">
            <ProfileAccountSidebar active={tab as ProfileAccountSection} onSignOut={logout} />
            <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {NAV.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    navigate({ to: "/profile", search: tabSearchParam(id), replace: true });
                  }}
                  className={cn(
                    "shrink-0 px-4 h-9 rounded-full text-[12px] font-semibold transition",
                    tab === id ? "bg-brand text-brand-foreground" : "bg-card ring-1 ring-rule text-navy-mid",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ana içerik */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-2xl lg:rounded-3xl ring-1 ring-rule/70 shadow-sm overflow-hidden">
              {tab === "info" && (
                <ProfileInfoTab
                  profile={profile}
                  email={email}
                  emailVerified={emailVerified}
                  phone={phone}
                  setPhone={setPhone}
                  badges={badges}
                  stats={stats}
                  strengthPct={strengthPct}
                  strengthItems={strengthItems}
                  verifySending={verifySending}
                  busy={busy}
                  onPatch={patchProfile}
                  onAvatarChange={async (newUrl) => {
                    const prev = profile.avatarUrl;
                    setProfile({ ...profile, avatarUrl: newUrl });
                    const ok = await patchProfile({ avatarUrl: newUrl });
                    if (!ok) setProfile({ ...profile, avatarUrl: prev });
                  }}
                />
              )}

              {tab === "badges" && badges && (
                <div className="p-6 sm:p-8">
                  <SectionTitle icon={Award} title="Моите значки" />
                  <UserBadgeGrid earned={badges.earned} stats={badges.stats} next={badges.next} />
                </div>
              )}

              {tab === "complaints" && (
                <ComplaintsTab complaints={complaints} title="Моите жалби" emptyMessage="Все още нямате жалби." />
              )}

              {tab === "supported" && (
                <ComplaintsTab complaints={supported} title="Подкрепени жалби" emptyMessage="Все още не сте подкрепили жалба." />
              )}

              {tab === "commented" && (
                <ComplaintsTab complaints={commented} title="Коментирани жалби" emptyMessage="Все още не сте коментирали жалба." />
              )}

              {tab === "saved" && (
                <ComplaintsTab complaints={[]} title="Запазени жалби" emptyMessage="Функцията за запазване скоро ще бъде налична." />
              )}

              {tab === "messages" && (
                <div className="p-4 sm:p-6">
                  <Messenger />
                </div>
              )}

              {tab === "security" && (
                <div className="p-6 sm:p-8 max-w-lg">
                  <SectionTitle icon={KeyRound} title="Смяна на парола" />
                  <p className="text-[13px] text-navy-mid mb-5">
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
                      className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:brightness-105 disabled:opacity-60"
                    >
                      {busy && <Loader2 className="size-4 animate-spin" />}
                      Обнови паролата
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoTab({
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
  badges: UserBadgePayload | null;
  stats: { total: number; resolved: number; views: number; follows: number };
  strengthPct: number;
  strengthItems: { done: boolean; label: string; action?: () => void }[];
  verifySending: boolean;
  busy: boolean;
  onPatch: (body: Partial<Profile & { phone?: string | null }>) => Promise<boolean>;
  onAvatarChange: (url: string | null) => Promise<void>;
}) {
  return (
    <div className="p-6 sm:p-8">
      {/* Üst: avatar + isim | profil gücü */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 pb-8 border-b border-rule/70">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <AvatarUpload
            url={profile.avatarUrl}
            userId={profile.id}
            size={112}
            onChange={(url) => void onAvatarChange(url)}
          />
          <div className="text-center sm:text-left min-w-0">
            <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink tracking-tight break-words">
              {profile.fullName || email.split("@")[0]}
            </h1>
            <p className="mt-1 text-[14px] text-navy-mid truncate max-w-full">{email}</p>
            {badges && badges.earned.length > 0 && (
              <div className="mt-3 flex justify-center sm:justify-start">
                <UserBadgeRow badges={badges.earned} />
              </div>
            )}
          </div>
        </div>

        <ProfileStrengthCard pct={strengthPct} items={strengthItems} verifySending={verifySending} />
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4 py-7 border-b border-rule/70">
        <StatPill label="Вашите жалби" value={stats.total} />
        <StatPill label="Решени" value={stats.resolved} />
        <StatPill label="Следени марки" value={stats.follows} />
      </div>

      {/* Alanlar */}
      <div className="pt-7 space-y-6 max-w-2xl">
        <EditableField
          label="Име и фамилия"
          value={profile.fullName ?? ""}
          onSave={async (v) => onPatch({ fullName: v })}
          busy={busy}
        />
        <EditableField
          label="Потребителско име"
          value={profile.username ?? ""}
          onSave={async (v) => onPatch({ username: v || null })}
          busy={busy}
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-navy-mid">Имейл</span>
            {!emailVerified && (
              <button
                type="button"
                onClick={() => strengthItems[0]?.action?.()}
                disabled={verifySending}
                className="text-[12px] font-semibold text-brand hover:underline inline-flex items-center gap-1"
              >
                {verifySending ? <Loader2 className="size-3 animate-spin" /> : null}
                Потвърди
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 h-12 rounded-xl ring-1 ring-rule bg-surface/50 px-4">
            <Mail className="size-4 text-navy-mid shrink-0" />
            <span className="text-[15px] text-ink truncate flex-1">{email}</span>
            {emailVerified && (
              <span className="text-[11px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-full shrink-0">
                Потвърден
              </span>
            )}
          </div>
        </div>
        <EditablePhoneField
          label="Телефон"
          value={phone}
          onSave={async (v) => {
            setPhone(v);
            return onPatch({ phone: v });
          }}
          busy={busy}
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-navy-mid">Парола</span>
          </div>
          <div className="h-12 rounded-xl ring-1 ring-rule bg-surface/50 px-4 flex items-center text-[15px] text-navy-mid tracking-widest">
            ••••••••
          </div>
          <p className="mt-1.5 text-[12px] text-navy-mid">
            За смяна на паролата отидете в секцията <span className="font-medium text-ink">Сигурност</span> от менюто.
          </p>
        </div>
        <EditableTextArea
          label="За мен"
          value={profile.bio ?? ""}
          onSave={async (v) => onPatch({ bio: v || null })}
          busy={busy}
        />
      </div>
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
    <div className="rounded-2xl ring-1 ring-rule bg-surface/40 p-5 h-fit">
      <div className="text-[14px] font-semibold text-ink">
        Силата на профила: <span className="text-brand">%{pct}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-rule overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-[13px]">
            <span
              className={cn(
                "mt-0.5 grid place-items-center size-5 rounded-full shrink-0",
                item.done ? "bg-brand text-brand-foreground" : "bg-rule text-navy-mid",
              )}
            >
              {item.done ? <CheckCircle2 className="size-3.5" /> : <Plus className="size-3.5" />}
            </span>
            {item.action && !item.done ? (
              <button
                type="button"
                onClick={item.action}
                disabled={verifySending}
                className="text-left text-brand font-medium hover:underline"
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

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-[12px] font-medium text-navy-mid">{label}</div>
      <div className="mt-1 font-display text-2xl sm:text-3xl font-black text-ink tabular-nums">
        {value.toLocaleString("bg-BG")}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Award; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-ink font-semibold text-[16px]">
      <Icon className="size-5 text-brand" />
      {title}
    </div>
  );
}

function EditableField({
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-navy-mid">{label}</span>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[12px] font-semibold text-brand hover:underline"
          >
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(value);
              }}
              className="text-[12px] font-medium text-navy-mid hover:text-ink"
            >
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const ok = await onSave(draft);
                if (ok) setEditing(false);
              }}
              className="text-[12px] font-semibold text-brand hover:underline disabled:opacity-50"
            >
              Запази
            </button>
          </div>
        )}
      </div>
      <input
        value={editing ? draft : value}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={!editing}
        className={cn(
          "w-full h-12 rounded-xl ring-1 px-4 text-[15px] transition focus:outline-none",
          editing
            ? "ring-brand/40 bg-card focus:ring-2 focus:ring-brand/40"
            : "ring-rule bg-surface/50 text-ink cursor-default",
        )}
      />
    </div>
  );
}

function EditablePhoneField({
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-navy-mid">{label}</span>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold text-brand hover:underline">
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditing(false); setDraft(value); }} className="text-[12px] font-medium text-navy-mid">
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const ok = await onSave(draft);
                if (ok) setEditing(false);
              }}
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
        <div className="h-12 rounded-xl ring-1 ring-rule bg-surface/50 px-4 flex items-center text-[15px] text-ink">
          {value || <span className="text-navy-mid">Няма добавен телефон</span>}
        </div>
      )}
    </div>
  );
}

function EditableTextArea({
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-navy-mid">{label}</span>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold text-brand hover:underline">
            Редактирай
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditing(false); setDraft(value); }} className="text-[12px] font-medium text-navy-mid">
              Отказ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const ok = await onSave(draft);
                if (ok) setEditing(false);
              }}
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
          "w-full rounded-xl ring-1 p-4 text-[15px] resize-none transition focus:outline-none",
          editing
            ? "ring-brand/40 bg-card focus:ring-2 focus:ring-brand/40"
            : "ring-rule bg-surface/50 cursor-default",
        )}
      />
    </div>
  );
}

function SecurityField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-navy-mid mb-2 block">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl ring-1 ring-rule bg-surface/50 px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}

function ComplaintsTab({
  complaints,
  title,
  emptyMessage,
}: {
  complaints: Complaint[];
  title: string;
  emptyMessage: string;
}) {
  const [page, setPage] = useState(1);
  const start = (page - 1) * PAGE_SIZE;
  const slice = complaints.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-6 sm:p-8">
      <SectionTitle icon={MessageSquare} title={title} />
      <div className="rounded-2xl ring-1 ring-rule divide-y divide-rule overflow-hidden">
        {complaints.length === 0 && (
          <div className="p-12 text-center text-navy-mid text-[14px]">
            {emptyMessage}{" "}
            {title === "Моите жалби" && (
              <Link to="/sikayet-yaz" className="text-brand font-semibold hover:underline">
                Напишете първата си жалба
              </Link>
            )}
          </div>
        )}
        {slice.map((c) => (
          <Link
            key={c.id}
            to="/sikayet/$id"
            params={{ id: complaintLinkId(c) }}
            className="flex items-center gap-4 p-4 sm:p-5 hover:bg-surface/60 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusClasses(dbStatusToUi(c.status))}`}
                >
                  {statusLabel[dbStatusToUi(c.status)]}
                </span>
                <span className="text-[12px] text-navy-mid">
                  {new Date(c.createdAt).toLocaleDateString("bg-BG")}
                </span>
              </div>
              <div className="mt-1.5 font-medium text-[15px] text-ink line-clamp-2">{c.title}</div>
            </div>
            <div className="text-[12px] text-navy-mid flex items-center gap-1 shrink-0">
              <Eye className="size-4" /> {c.views}
            </div>
          </Link>
        ))}
      </div>
      {complaints.length > PAGE_SIZE && (
        <div className="mt-4">
          <Pagination page={page} pageSize={PAGE_SIZE} total={complaints.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
