import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Общи положения",
    p: [
      "verno.bg уважава поверителността на потребителите. Тази политика описва какви данни събираме, как ги използваме и какви права имате. С използването на платформата приемате настоящата политика.",
    ],
  },
  {
    h: "2. Събирани данни",
    p: [
      "При регистрация: име, имейл и телефон (за SMS верификация). При използване: IP адрес, информация за устройството/браузъра, сесийни записи. Съдържание: жалби, коментари, оценки и качени файлове.",
    ],
  },
  {
    h: "3. Цели на обработката",
    p: [
      "Данните се използват за управление на акаунта, публикуване и предаване на жалби към марки, сигурност и модерация, известия и подобряване на услугата. Данните ви **не се продават** на трети лица.",
    ],
  },
  {
    h: "4. Бисквитки",
    p: [
      "Платформата използва задължителни бисквитки за поддържане на сесията и запомняне на предпочитания (напр. тема). Не използваме рекламни или проследяващи бисквитки на трети страни.",
    ],
  },
  {
    h: "5. Сигурност",
    p: [
      "Данните се предават по криптирана връзка (HTTPS). Паролите се съхраняват като необратими хешове. Достъпът до прикачени файлове е ограничен според правата на потребителя и марката.",
    ],
  },
  {
    h: "6. Анонимност",
    p: [
      "Можете да публикувате жалба анонимно. В този случай името ви не се показва на други потребители и на марката; само екипът за модерация вижда самоличността на подателя.",
    ],
  },
  {
    h: "7. Контакт",
    p: [
      `За въпроси относно поверителността: ${SITE_CONTACT_EMAIL}. Вижте също информацията за личните данни (GDPR) на /kvkk.`,
    ],
  },
];

export const Route = createFileRoute("/_site/(kurumsal)/gizlilik")({
  head: () => ({
    ...seoHead({
      title: "Политика за поверителност — verno.bg",
      description:
        "Политика за поверителност на verno.bg: какви данни събираме, как ги защитаваме и правата ви.",
      path: "/gizlilik",
    }),
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Verno.bg</p>
        <h1 className="text-3xl sm:text-4xl font-display font-black mb-2 text-ink">Политика за поверителност</h1>
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
