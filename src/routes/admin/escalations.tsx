import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, ShieldAlert, Clock } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiSend } from "@/lib/admin-api";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/admin/escalations")({ component: EscalationsPage });

type Esc = {
  id: string;
  complaint_id: string;
  brand_id: string;
  reason: string;
  note: string | null;
  status: string;
  decision: string | null;
  created_at: string;
  brands?: { name: string; slug: string } | null;
  complaints?: { title: string; short_id: string | null } | null;
};

const PRIMARY_ACTIONS: { v: string; label: string; tone: string }[] = [
  { v: "approve", label: "Одобри", tone: "bg-brand text-brand-foreground" },
  { v: "reject", label: "Отхвърли", tone: "ring-1 ring-rule text-ink hover:bg-surface" },
  { v: "return", label: "Върни на марката", tone: "bg-surface text-ink ring-1 ring-rule" },
];

const SECONDARY_ACTIONS: { v: string; label: string; tone: string }[] = [
  { v: "hide", label: "Скрий", tone: "ring-1 ring-rule text-navy" },
  { v: "spam", label: "Spam", tone: "bg-orange-500/90 text-white" },
  { v: "delete", label: "Sil", tone: "bg-danger text-white" },
  { v: "warn_user", label: "Предупреди потребителя", tone: "bg-warning text-ink" },
  { v: "ban_user", label: "Ban", tone: "bg-red-700 text-white" },
  { v: "change_brand", label: "Смени марката", tone: "ring-1 ring-brand text-brand" },
];

function EscalationsPage() {
  const [items, setItems] = useState<Esc[]>([]);
  const [active, setActive] = useState<Esc | null>(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"open" | "all">("open");

  async function load() {
    const data = await apiGet<{ items: Esc[] }>("/api/admin/escalations");
    const all = data?.items ?? [];
    setItems(
      filter === "open" ? all.filter((i) => i.status === "open" || i.status === "pending") : all,
    );
  }
  useEffect(() => {
    load();
    /* eslint-disable-next-line */
  }, [filter]);

  async function decide(action: string) {
    if (!active) return;
    if (!(await apiSend("/api/admin/escalations", "PATCH", { id: active.id, action, note }))) return;
    toast.success("Решението е приложено");
    setActive(null);
    setNote("");
    load();
  }

  const openCount = items.filter((i) => i.status === "open" || i.status === "pending").length;

  return (
    <div className="px-6 lg:px-10 py-8 space-y-6">
      <div>
        <div className="eyebrow text-navy-mid">Супер админ</div>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-ink flex items-center gap-2">
          <ShieldAlert className="size-7 text-warning" /> Център за ескалации
        </h1>
        <p className="text-[13.5px] text-navy-mid mt-1">
          Жалби, ескалирани от марката или изискващи преглед. Поддръжка:{" "}
          <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-brand hover:underline">
            {SITE_CONTACT_EMAIL}
          </a>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg">
        <div className="bg-card rounded-xl ring-1 ring-rule p-4">
          <div className="text-[11px] uppercase tracking-wider text-navy-mid font-semibold">
            Отворени ескалации
          </div>
          <div className="mt-1 font-display text-2xl font-black text-ink">{openCount}</div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-rule p-4">
          <div className="text-[11px] uppercase tracking-wider text-navy-mid font-semibold">Списък</div>
          <div className="mt-1 font-display text-2xl font-black text-ink">{items.length}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        <aside className="bg-card rounded-2xl ring-1 ring-rule overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
          <div className="p-4 border-b border-rule flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-ink">Записи</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "open" | "all")}
              className="h-8 rounded-lg ring-1 ring-rule px-2 text-[12px] bg-card"
            >
              <option value="open">Отворени</option>
              <option value="all">Tümü</option>
            </select>
          </div>
          <ul className="overflow-y-auto divide-y divide-rule flex-1">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => setActive(it)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface/80 transition ${
                    active?.id === it.id ? "bg-warning-soft/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-warning shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-warning truncate">
                      {it.reason}
                    </span>
                    <span className="ml-auto text-[10px] uppercase text-navy-mid shrink-0">
                      {it.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink line-clamp-2">
                    {it.complaints?.title ?? "—"}
                  </div>
                  <div className="text-[11px] text-navy-mid mt-0.5 flex items-center gap-1">
                    <Clock className="size-3" />
                    {it.brands?.name} · {new Date(it.created_at).toLocaleDateString("bg-BG")}
                  </div>
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="p-8 text-center text-navy-mid text-[13px]">Няма записи за ескалация.</li>
            )}
          </ul>
        </aside>

        <section className="bg-card rounded-2xl ring-1 ring-rule p-6 min-h-[320px]">
          {active ? (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-warning px-2 py-0.5 rounded bg-warning-soft">
                  {active.reason}
                </span>
                <h2 className="mt-2 font-display text-2xl font-black text-ink">
                  {active.complaints?.title ?? "Жалба"}
                </h2>
                <div className="mt-2 text-[12px] text-navy-mid flex flex-wrap gap-x-3 gap-y-1">
                  {active.brands?.slug && (
                    <Link
                      to="/firma/$slug"
                      params={{ slug: active.brands.slug }}
                      className="hover:text-brand"
                    >
                      {active.brands.name}
                    </Link>
                  )}
                  <Link
                    to="/sikayet/$id"
                    params={{ id: active.complaint_id }}
                    className="text-brand inline-flex items-center gap-0.5"
                  >
                    #{active.complaints?.short_id ?? "детайли"}{" "}
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {active.note && (
                <div className="rounded-xl bg-surface ring-1 ring-rule p-4 text-[13.5px] text-navy whitespace-pre-wrap">
                  {active.note}
                </div>
              )}

              <div>
                <label className="text-[12px] font-medium text-navy-mid">Бележка за решението</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Незадължително пояснение…"
                  className="mt-1 w-full rounded-lg ring-1 ring-rule p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-navy-mid mb-2">
                  Основни решения
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRIMARY_ACTIONS.map((a) => (
                    <button
                      key={a.v}
                      type="button"
                      onClick={() => decide(a.v)}
                      className={`h-9 px-4 rounded-lg text-[13px] font-semibold ${a.tone}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-navy-mid mb-2">
                  Допълнителни действия
                </div>
                <div className="flex flex-wrap gap-2">
                  {SECONDARY_ACTIONS.map((a) => (
                    <button
                      key={a.v}
                      type="button"
                      onClick={() => decide(a.v)}
                      className={`h-8 px-3 rounded-lg text-[12px] font-semibold ${a.tone}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[280px] grid place-items-center text-navy-mid text-[14px]">
              Изберете ескалация отляво или проверете опашката за модерация.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
