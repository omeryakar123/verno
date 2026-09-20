import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { seoHead, breadcrumbLd, SITE_NAME } from "@/lib/seo";
import { SITE_CONTACT_EMAIL, siteContactMailto } from "@/lib/contact";

export const Route = createFileRoute("/_site/(kurumsal)/iletisim")({
  head: () => ({
    ...seoHead({
      title: `Контакт — ${SITE_NAME}`,
      description:
        "Свържете се с екипа на verno.bg: въпроси, предложения, партньорства и заявки от марки на info@verno.bg.",
      path: "/iletisim",
    }),
    scripts: [
      breadcrumbLd([
        { name: "Начало", path: "/" },
        { name: "Контакт", path: "/iletisim" },
      ]),
    ],
  }),
  component: Page,
});

function Page() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = `${message}\n\n— ${name || "Без име"}`;
    window.location.href = siteContactMailto(subject || "verno.bg контакт", body);
  }

  return (
    <div className="listing-page">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-[#695de9]/12" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 left-0 size-40 rounded-full bg-[#3ad08f]/18" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h1 className="font-display text-3xl font-black text-ink sm:text-5xl">Контакт</h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-navy-mid">
            За въпроси, предложения, партньорства и заявки от марки — пишете ни. Отговаряме в работни дни.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 pb-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-4">
          <a
            href={siteContactMailto()}
            className="block rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgb(16_20_31/0.07)] transition hover:-translate-y-0.5"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[#3ad08f]/12 text-[#1f9d6a]">
              <Mail className="size-5" />
            </span>
            <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-navy-mid">Имейл</div>
            <div className="mt-1 break-all text-lg font-semibold text-ink">{SITE_CONTACT_EMAIL}</div>
          </a>
          <div className="rounded-3xl bg-primary p-6 text-white">
            <ShieldCheck className="size-6 text-brand" />
            <h2 className="mt-3 text-lg font-semibold">Марки и партньорства</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              За Pro членство, реклама и верификация използвайте същата форма — посочете темата ясно.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgb(16_20_31/0.07)]">
            <MessageSquare className="size-6 text-[#695de9]" />
            <h2 className="mt-3 text-lg font-semibold text-ink">Жалби към марки</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-mid">
              Ако имате проблем с продукт или услуга, подайте жалба през платформата — не към този имейл.
            </p>
          </div>
        </aside>

        <form
          onSubmit={submit}
          className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgb(16_20_31/0.08)] sm:p-8"
        >
          <h2 className="text-xl font-semibold text-ink">Изпратете съобщение</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-mid">
                Име и фамилия
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-2xl bg-[#f4f6fb] px-4 text-sm outline-none ring-1 ring-transparent focus:ring-[#695de9]/35"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-mid">
                Тема
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 w-full rounded-2xl bg-[#f4f6fb] px-4 text-sm outline-none ring-1 ring-transparent focus:ring-[#695de9]/35"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-mid">
              Съобщение
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={7}
              className="w-full rounded-2xl bg-[#f4f6fb] p-4 text-sm outline-none ring-1 ring-transparent focus:ring-[#695de9]/35"
            />
          </label>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="h-12 rounded-full bg-[#3ad08f] px-7 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgb(58_208_143/0.32)] hover:bg-[#42e29d]"
            >
              Изпрати по имейл
            </button>
            <span className="text-[12px] text-navy-mid">
              Отваря се имейл приложението ви с готов текст.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
