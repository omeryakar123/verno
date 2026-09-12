import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
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
    <div>
      <div className="relative overflow-hidden border-b border-rule bg-gradient-to-b from-brand-soft/40 to-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-ink mb-3">Контакт</h1>
          <p className="text-navy-mid max-w-xl">
            За въпроси, предложения, партньорства и заявки от марки — пишете ни на имейл.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <a
          href={siteContactMailto()}
          className="inline-flex bg-card rounded-2xl ring-1 ring-rule p-6 hover:ring-brand/40 transition mb-10 w-full sm:w-auto"
        >
          <div className="size-10 rounded-xl bg-brand-soft text-brand grid place-items-center mr-4 shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-navy-mid">Имейл</div>
            <div className="mt-1 font-semibold text-ink break-all">{SITE_CONTACT_EMAIL}</div>
          </div>
        </a>
        <form onSubmit={submit} className="bg-card rounded-2xl ring-1 ring-rule p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Име и фамилия"
              className="h-12 px-4 rounded-lg ring-1 ring-rule focus:outline-none focus:ring-brand/40"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Тема"
              className="h-12 px-4 rounded-lg ring-1 ring-rule focus:outline-none focus:ring-brand/40"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Вашето съобщение"
            rows={6}
            className="w-full p-4 rounded-lg ring-1 ring-rule focus:outline-none focus:ring-brand/40"
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button className="h-11 px-6 rounded-full bg-brand text-brand-foreground font-semibold hover:brightness-105">
              Изпрати по имейл
            </button>
            <span className="text-[12px] text-navy-mid">
              При натискане се отваря имейл приложението ви с готов текст.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
