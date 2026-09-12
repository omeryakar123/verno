import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  PenLine,
  Phone,
  Scale,
  Shield,
  Star,
  Target,
  Trash2,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { InfoBlock, InfoPage } from "@/lib/info-pages-data";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  edit: PenLine,
  award: Award,
  book: BookOpen,
  shield: Shield,
  phone: Phone,
  file: FileText,
  star: Star,
  check: CheckCircle2,
  clock: Clock,
  message: MessageCircle,
  users: Users,
  target: Target,
  eye: Eye,
  scale: Scale,
  user: User,
  briefcase: Briefcase,
  trash: Trash2,
};

function CardIcon({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Shield;
  return (
    <span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
      <Icon className="size-5" />
    </span>
  );
}

function StepsBlock({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="mt-6 space-y-0">
      {items.map((s, i) => (
        <div key={s.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="size-9 rounded-full bg-primary text-white grid place-items-center text-sm font-bold shrink-0">
              {i + 1}
            </div>
            {i < items.length - 1 ? <div className="w-0.5 flex-1 bg-rule min-h-6" /> : null}
          </div>
          <div className={`flex-1 min-w-0 ${i < items.length - 1 ? "pb-6" : ""}`}>
            <h3 className="font-semibold text-[15px] text-ink">{s.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-navy-mid">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsBlock({ items }: { items: { icon: string; title: string; body: string }[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((c) => (
        <div key={c.title} className="rounded-2xl ring-1 ring-rule bg-card p-4">
          <div className="flex items-center gap-3">
            <CardIcon name={c.icon} />
            <h3 className="font-semibold text-[15px] text-ink">{c.title}</h3>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-navy-mid">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

function ContactBlock({ phone, email, address }: { phone: string; email: string; address: string }) {
  const tel = `+359${phone.replace(/^0/, "")}`;
  const rows = [
    { icon: Phone, label: "Телефон", value: phone, href: `tel:${tel}` },
    { icon: Mail, label: "Имейл", value: email, href: `mailto:${email}` },
    { icon: MapPin, label: "Адрес", value: address, href: undefined },
  ] as const;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-rule bg-card divide-y divide-rule">
      {rows.map((r) => {
        const Inner = r.href ? "a" : "div";
        return (
          <Inner
            key={r.label}
            {...(r.href ? { href: r.href } : {})}
            className="flex items-center gap-3 px-4 py-4 hover:bg-surface/60 transition"
          >
            <span className="grid place-items-center size-11 rounded-xl bg-brand/10 text-brand shrink-0">
              <r.icon className="size-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-navy-mid">{r.label}</div>
              <div className="mt-0.5 text-[15px] font-semibold text-ink break-all">{r.value}</div>
            </div>
          </Inner>
        );
      })}
    </div>
  );
}

export function InfoPageShell({ page }: { page: InfoPage }) {
  const HeroIcon = ICONS[page.icon] ?? HelpCircle;

  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden border-b border-rule bg-white">
        <div
          className="pointer-events-none absolute -top-4 right-0 size-40 rounded-full bg-primary/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 size-28 rounded-full bg-brand/10"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-14">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
            <HeroIcon className="size-6" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-ink leading-tight">
            {page.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-mid">{page.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 pb-16">
        {page.blocks.map((block: InfoBlock, i) => {
          if (block.type === "text") {
            return (
              <p key={i} className="mt-6 text-[14px] leading-relaxed text-navy first:mt-0">
                {block.body}
              </p>
            );
          }
          if (block.type === "steps") return <StepsBlock key={i} items={block.items} />;
          if (block.type === "cards") return <CardsBlock key={i} items={block.items} />;
          return (
            <ContactBlock
              key={i}
              phone={block.phone}
              email={block.email}
              address={block.address}
            />
          );
        })}

        {page.cta ? (
          <Link
            to={page.cta.to}
            search={page.cta.search as never}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:brightness-105 transition"
          >
            {page.cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
