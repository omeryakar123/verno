import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, ShieldAlert, X } from "lucide-react";
import { apiGet, apiSend, apiSendJson } from "@/lib/admin-api";
import { Modal } from "@/components/ui/modal";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  email_verified: boolean;
  is_banned: boolean;
  created_at: string;
};
type AppRole = "user" | "brand" | "moderator" | "admin" | "super_admin";
type Sanction = {
  id: string;
  type: "warning" | "ban_temp" | "ban_permanent" | "unban";
  reason: string;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/kullanicilar")({
  component: AdminUsersPage,
});

const ROLES: AppRole[] = ["user", "brand", "moderator", "admin", "super_admin"];
const TYPE_LABEL: Record<Sanction["type"], string> = {
  warning: "Предупреждение",
  ban_temp: "Временен бан",
  ban_permanent: "Постоянен бан",
  unban: "Банът е премахнат",
};

function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [sanctionUser, setSanctionUser] = useState<Profile | null>(null);
  const [reminding, setReminding] = useState(false);

  const unverifiedCount = useMemo(
    () => users.filter((u) => !u.email_verified).length,
    [users],
  );

  async function load() {
    const data = await apiGet<{ items: Profile[]; roles: Record<string, string[]> }>("/api/admin/users");
    setUsers(data?.items ?? []);
    setRoles(data?.roles ?? {});
  }
  useEffect(() => { load(); }, []);

  async function remindUnverified() {
    if (unverifiedCount === 0) {
      toast.message("Няма непотвърдени потребители.");
      return;
    }
    if (!confirm(`Да изпратим ли напомняне и имейл за потвърждение на ${unverifiedCount} потребители?`)) return;
    setReminding(true);
    const data = await apiSendJson<{ ok?: boolean; notified?: number; emailed?: number; errors?: { email: string; error: string }[] }>(
      "/api/admin/email-verification-remind",
      "POST",
      {},
    );
    setReminding(false);
    if (!data?.ok) return;
    toast.success(`${data.notified ?? 0} известия, ${data.emailed ?? 0} имейла изпратени.`);
    if (data.errors?.length) {
      toast.error(`Грешка при ${data.errors.length} потребители.`);
    }
  }

  async function toggleRole(userId: string, role: AppRole, has: boolean) {
    const ok = has
      ? await apiSend("/api/admin/users", "DELETE", { userId, role })
      : await apiSend("/api/admin/users", "POST", { userId, role });
    if (!ok) return;
    toast.success("Ролята е обновена"); load();
  }

  return (
    <div className="px-6 lg:px-10 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-navy-mid">Управление на членове</div>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-ink">Потребители</h1>
          {unverifiedCount > 0 && (
            <p className="mt-2 text-[13px] text-warning">
              {unverifiedCount} потребители все още не са потвърдили имейла си.
            </p>
          )}
        </div>
        <button
          onClick={remindUnverified}
          disabled={reminding || unverifiedCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-medium h-10 px-4 text-sm hover:brightness-110 disabled:opacity-60"
        >
          {reminding ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Напомняне на непотвърдените
        </button>
      </div>

      <div className="bg-card rounded-2xl ring-1 ring-rule overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead className="bg-surface text-navy-mid text-left text-[11.5px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-semibold">Потребител</th>
              <th className="px-4 py-3 font-semibold">Имейл</th>
              <th className="px-4 py-3 font-semibold">Роли</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Регистрация</th>
              <th className="px-4 py-3 text-right font-semibold">Действие</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const userRoles = roles[u.id] ?? [];
              return (
                <tr key={u.id} className="border-t border-rule">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{u.full_name || u.username || "—"}</div>
                    <div className="text-[12px] text-navy-mid">{u.username ? `@${u.username}` : u.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] text-ink">{u.email || "—"}</div>
                    <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${u.email_verified ? "bg-brand-soft text-brand" : "bg-warning-soft text-warning"}`}>
                      {u.email_verified ? "Потвърден" : "Непотвърден"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ROLES.map((r) => {
                        const has = userRoles.includes(r);
                        return (
                          <button key={r} onClick={() => toggleRole(u.id, r, has)} className={`text-[11px] px-2 py-1 rounded-full ${has ? "bg-brand-soft text-brand" : "bg-surface text-navy-mid hover:bg-rule"}`}>
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] px-2 py-1 rounded-full ${u.is_banned ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand"}`}>
                      {u.is_banned ? "Блокиран" : "Активен"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-mid">{new Date(u.created_at).toLocaleDateString("bg-BG")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSanctionUser(u)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-navy hover:text-danger">
                      <ShieldAlert className="size-3.5" /> Санкция
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-navy-mid">Все още няма потребители.</td></tr>}
          </tbody>
        </table>
      </div>

      <SanctionModal
        user={sanctionUser}
        onClose={() => setSanctionUser(null)}
        onDone={() => { setSanctionUser(null); load(); }}
      />
    </div>
  );
}

function SanctionModal({ user, onClose, onDone }: { user: Profile | null; onClose: () => void; onDone: () => void }) {
  const [shown, setShown] = useState<Profile | null>(user);
  const [history, setHistory] = useState<Sanction[]>([]);
  const [type, setType] = useState<Sanction["type"]>("warning");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);

  // Açılışta yeni kullanıcıyı yansıt; kapanış animasyonu boyunca son kullanıcı
  // görünür kalsın diye null'a düşürmüyoruz.
  useEffect(() => { if (user) setShown(user); }, [user]);

  async function loadHistory(id: string) {
    const d = await apiGet<{ items: Sanction[] }>(`/api/admin/sanctions?userId=${id}`);
    setHistory(d?.items ?? []);
  }
  useEffect(() => { if (user) { setType("warning"); setReason(""); loadHistory(user.id); } /* eslint-disable-next-line */ }, [user?.id]);

  async function submit() {
    if (!shown) return;
    if (type !== "unban" && reason.trim().length < 3) return toast.error("Въведете причина");
    setBusy(true);
    const ok = await apiSend("/api/admin/sanctions", "POST", {
      userId: shown.id, type, reason: reason.trim(), days,
    });
    setBusy(false);
    if (!ok) return;
    toast.success("Санкцията е приложена");
    onDone();
  }

  return (
    <Modal open={!!user} onClose={onClose} className="max-w-lg bg-card rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-lift">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">
            Санкция · {shown?.full_name || shown?.username || shown?.id.slice(0, 8)}
          </h3>
          <button onClick={onClose}><X className="size-4 text-navy-mid" /></button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {(["warning", "ban_temp", "ban_permanent", "unban"] as const).map((tp) => (
              <button key={tp} onClick={() => setType(tp)} className={`h-9 rounded-lg text-[12.5px] font-medium ring-1 ${type === tp ? "bg-brand text-brand-foreground ring-brand" : "ring-rule hover:bg-surface text-ink"}`}>
                {TYPE_LABEL[tp]}
              </button>
            ))}
          </div>
          {type === "ban_temp" && (
            <label className="flex items-center gap-2 text-[13px] text-navy">
              Срок:
              <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-20 h-9 rounded-lg ring-1 ring-rule px-2 text-sm" />
              дни
            </label>
          )}
          {type !== "unban" && (
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Причина (ще бъде съобщена на потребителя)" className="w-full rounded-lg ring-1 ring-rule p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
          )}
          <button disabled={busy} onClick={submit} className="w-full h-10 rounded-lg bg-brand text-brand-foreground text-[13px] font-semibold disabled:opacity-60">
            Приложи
          </button>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-navy-mid uppercase tracking-wider mb-2">История</div>
          {history.length === 0 ? (
            <p className="text-[13px] text-navy-mid">Няма записи.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-[13px]">
                  <span className={`shrink-0 mt-0.5 text-[11px] px-2 py-0.5 rounded-full ${s.type === "unban" ? "bg-brand-soft text-brand" : s.type === "warning" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"}`}>
                    {TYPE_LABEL[s.type]}{s.active ? "" : " (затворено)"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink">{s.reason}</span>
                    <span className="block text-[11px] text-navy-mid">
                      {new Date(s.created_at).toLocaleString("bg-BG")}
                      {s.expires_at && ` · край ${new Date(s.expires_at).toLocaleDateString("bg-BG")}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
    </Modal>
  );
}
