import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Администратор на данни",
    p: [
      "Съгласно GDPR и българското законодателство verno.bg (Платформата) обработва личните ви данни като администратор на данни в обхвата, описан по-долу.",
    ],
  },
  {
    h: "2. Обработвани лични данни",
    p: [
      "При регистрация и използване: идентификационни данни (име, потребителско име), контактни данни (имейл, телефон), данни за сигурност (IP, сесия, устройство), съдържание (текст на жалби, коментари, оценки, файлове).",
    ],
  },
  {
    h: "3. Цели на обработката",
    p: [
      "Създаване и управление на акаунт, публикуване и предаване на жалби към марки, модерация и сигурност, известия, изпълнение на правни задължения и подобряване на услугата.",
    ],
  },
  {
    h: "4. Предаване на данни",
    p: [
      "Съдържанието на жалбата се споделя с марката-адресат за целите на решаване. При анонимни жалби самоличността не се показва на марката. Данните не се продават и не се споделят за маркетинг на трети лица, освен при законово задължение.",
    ],
  },
  {
    h: "5. Срок на съхранение",
    p: [
      "Данните се съхраняват докато акаунтът е активен и в сроковете, предвидени от закона. При заявка за изтриване данните без правно задължение за съхранение се изтриват или анонимизират в разумен срок.",
    ],
  },
  {
    h: "6. Вашите права (GDPR)",
    p: [
      "Имате право на достъп, коригиране, изтриване, ограничаване на обработката, преносимост и възражение срещу автоматизирано профилиране.",
      `Заявки: ${SITE_CONTACT_EMAIL}. Отговор в срок до 30 дни без такса, освен при необосновани или повторни искания.`,
    ],
  },
];

export const Route = createFileRoute("/_site/(kurumsal)/kvkk")({
  head: () => ({
    ...seoHead({
      title: "Информация за личните данни (GDPR) — verno.bg",
      description:
        "Как verno.bg обработва личните данни, срокове на съхранение и правата ви по GDPR.",
      path: "/kvkk",
    }),
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Verno.bg</p>
        <h1 className="text-3xl sm:text-4xl font-display font-black mb-2 text-ink">Лични данни (GDPR)</h1>
        <p className="text-[13px] text-navy-mid mb-10">Последна актуализация: септември 2026</p>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h} className="rounded-2xl bg-card ring-1 ring-rule p-6">
              <h2 className="text-lg font-semibold text-ink mb-2">{s.h}</h2>
              {s.p.map((par, i) => (
                <p key={i} className="text-navy leading-relaxed mb-2">{par}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
