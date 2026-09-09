import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Building2, MessageSquare, FileText, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BrandAvatar } from "@/components/cards";
import { complaintLinkId } from "@/lib/complaint-link";
import { Modal } from "@/components/ui/modal";

type BrandHit = { id: string; slug: string; name: string; logo_url: string | null; website?: string | null };
type ComplaintHit = { id: string; public_id: string | null; title: string; brands?: { slug: string; name: string } | null };
type BlogHit = { id: string; slug: string; title: string };

function useGlobalSearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return { open, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
}

export function GlobalSearchTrigger({ className }: { className?: string }) {
  const { open, openModal, closeModal } = useGlobalSearchModal();
  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          className ??
          "inline-flex h-9 items-center gap-2 rounded-full bg-card/70 px-3 text-[13px] text-navy-mid ring-1 ring-rule backdrop-blur transition hover:ring-brand/40"
        }
      >
        <Search className="size-4" /> Търси марка, жалба или код…
        <kbd className="ml-2 hidden items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[10px] text-navy-mid sm:inline-flex">
          ⌘K
        </kbd>
      </button>
      <GlobalSearchModal open={open} onClose={closeModal} />
    </>
  );
}

/** Navbar icon — mobile header (şikayetvar style). */
export function GlobalSearchIconTrigger({ className }: { className?: string }) {
  const { open, openModal, closeModal } = useGlobalSearchModal();
  return (
    <>
      <button
        type="button"
        aria-label="Търси"
        onClick={openModal}
        className={
          className ??
          "grid size-10 shrink-0 place-items-center rounded-lg text-[#626692] transition hover:bg-[#f3f4f8] hover:text-[#272635]"
        }
      >
        <Search className="size-5" />
      </button>
      <GlobalSearchModal open={open} onClose={closeModal} />
    </>
  );
}

function GlobalSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<BrandHit[]>([]);
  const [complaints, setComplaints] = useState<ComplaintHit[]>([]);
  const [blogs, setBlogs] = useState<BlogHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 40); }
    else { setQ(""); setDebounced(""); }
  }, [open]);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setBrands([]); setComplaints([]); setBlogs([]); setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => (r.ok ? r.json() : { brands: [], complaints: [], blogs: [] }))
      .then((d: { brands: BrandHit[]; complaints: ComplaintHit[]; blogs: BlogHit[] }) => {
        if (cancelled) return;
        setBrands(d.brands ?? []);
        setComplaints(d.complaints ?? []);
        setBlogs(d.blogs ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [debounced]);

  const empty = useMemo(() => debounced.length >= 2 && !loading && brands.length === 0 && complaints.length === 0 && blogs.length === 0, [debounced, loading, brands, complaints, blogs]);

  function go(to: string) { onClose(); setTimeout(() => navigate({ to }), 0); }

  return (
    <Modal open={open} onClose={onClose} align="top" className="max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 h-14 border-b border-rule">
          <Search className="size-4 text-navy-mid" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Марка, заглавие на жалба или 6-цифрен код (напр. KJ-4M2X)…" className="flex-1 bg-transparent text-[14px] focus:outline-none" />
          {loading && <Loader2 className="size-4 text-navy-mid animate-spin" />}
          <button onClick={onClose} className="text-navy-mid hover:text-ink"><X className="size-4" /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!debounced && <div className="p-6 text-center text-[13px] text-navy-mid">Започнете да пишете… Отворете отвсякъде с <kbd className="ml-1 text-[10px] bg-surface rounded px-1.5 py-0.5">⌘K</kbd>.</div>}
          {empty && <div className="p-8 text-center text-[13.5px] text-navy-mid">Няма резултати за „{debounced}“.</div>}

          {brands.length > 0 && (
            <Section icon={Building2} title="Марки">
              {brands.map((b) => (
                <button key={b.id} onClick={() => go(`/firma/${b.slug}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-soft/40 text-left">
                  <BrandAvatar name={b.name} slug={b.slug} logoUrl={b.logo_url} website={b.website} size={32} />
                  <span className="text-[14px] text-ink font-medium">{b.name}</span>
                  <span className="ml-auto text-[11px] text-navy-mid">/{b.slug}</span>
                </button>
              ))}
            </Section>
          )}

          {complaints.length > 0 && (
            <Section icon={MessageSquare} title="Жалби">
              {complaints.map((c) => (
                <button key={c.id} onClick={() => go(`/sikayet/${complaintLinkId({ id: c.id, public_id: c.public_id })}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-soft/40 text-left">
                  {c.public_id && <span className="font-mono text-[10.5px] bg-surface text-navy rounded px-1.5 py-0.5">{c.public_id}</span>}
                  <span className="text-[13.5px] text-ink line-clamp-1">{c.title}</span>
                  {c.brands?.name && <span className="ml-auto text-[11.5px] text-navy-mid shrink-0">{c.brands.name}</span>}
                </button>
              ))}
            </Section>
          )}

          {blogs.length > 0 && (
            <Section icon={FileText} title="Blog">
              {blogs.map((b) => (
                <Link key={b.id} to="/" onClick={onClose} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-soft/40 text-left">
                  <span className="text-[13.5px] text-ink">{b.title}</span>
                </Link>
              ))}
            </Section>
          )}
        </div>
    </Modal>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Search; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule first:border-t-0">
      <div className="px-4 pt-3 pb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-mid">
        <Icon className="size-3" /> {title}
      </div>
      <div className="pb-1">{children}</div>
    </div>
  );
}
