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
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#695de9]/10 text-[#695de9]">
      <Icon className="size-5" />
    </span>
  );
}

function StepsBlock({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="mt-8 space-y-0">
      {items.map((s, i) => (
        <div key={s.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#695de9] text-sm font-bold text-white shadow-[0_8px_20px_rgb(105_93_233/0.28)]">
              {i + 1}
            </div>
            {i < items.length - 1 ? <div className="min-h-8 w-0.5 flex-1 bg-[#ebecef]" /> : null}
          </div>
          <div className={`min-w-0 flex-1 ${i < items.length - 1 ? "pb-8" : ""}`}>
            <h3 className="text-[17px] font-semibold text-ink">{s.title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-navy-mid">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsBlock({ items }: { items: { icon: string; title: string; body: string }[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {items.map((c) => (
        <div
          key={c.title}
          className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgb(16_20_31/0.07)]"
        >
          <div className="flex items-center gap-3">
            <CardIcon name={c.icon} />
            <h3 className="text-[16px] font-semibold text-ink">{c.title}</h3>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-navy-mid">{c.body}</p>
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
    <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-[0_12px_32px_rgb(16_20_31/0.07)] divide-y divide-[#ebecef]">
      {rows.map((r) => {
        const Inner = r.href ? "a" : "div";
        return (
          <Inner
            key={r.label}
            {...(r.href ? { href: r.href } : {})}
            className="flex items-center gap-3 px-5 py-5 transition hover:bg-[#f4f6fb]"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#3ad08f]/12 text-[#1f9d6a]">
              <r.icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-navy-mid">{r.label}</div>
              <div className="mt-0.5 break-all text-[16px] font-semibold text-ink">{r.value}</div>
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
    <div className="listing-page">
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[#695de9]/12"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-0 size-40 rounded-full bg-[#3ad08f]/18"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[#695de9] text-white shadow-[0_12px_28px_rgb(105_93_233/0.28)]">
            <HeroIcon className="size-7" />
          </div>
          <h1 className="font-display text-3xl font-black leading-tight text-ink sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-navy-mid">{page.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 pb-20 sm:px-6">
        {page.blocks.map((block: InfoBlock, i) => {
          if (block.type === "text") {
            return (
              <p key={i} className="mt-6 text-[15px] leading-relaxed text-navy first:mt-0">
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
            className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-[#3ad08f] px-7 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgb(58_208_143/0.32)] transition hover:bg-[#42e29d]"
          >
            {page.cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
