import { pickTurkishDisplayName } from "@/lib/server/ai/prompts";

export type TalkedPreviewComment = {
  id: string;
  body: string;
  created_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
};

type Topic =
  | "withdrawal"
  | "deposit"
  | "bonus"
  | "verification"
  | "support"
  | "account"
  | "technical"
  | "general";

type CommentStyle =
  | "empathy"
  | "frustrated"
  | "skeptical"
  | "supportive"
  | "question"
  | "tip"
  | "brief"
  | "experience";

/** Жалбата е публикувана — забавяния преди коментарите да се появят (минути). */
const REVEAL_BASE_MIN = [240, 1080, 4320] as const;

const SLOT_STYLES: CommentStyle[] = ["empathy", "frustrated", "supportive"];

const STYLE_OPENERS: Record<CommentStyle, string[]> = {
  empathy: [
    "Мъчно ми стана, докато чета,",
    "Наистина неприятна ситуация —",
    "Минавах през подобно,",
    "Надявам се да се реши бързо;",
    "Разбирам разочарованието ти,",
    "Толкова дълго чакане е неприемливо, но",
  ],
  frustrated: [
    "Пак същата фирма, същите оправдания?",
    "Вече дори не се изненадвам,",
    "Тази тема при {brand} се повтаря постоянно;",
    "Омръзнаха ми такива отговори —",
    "Ядосах се, докато чета,",
    "Всеки път един и същ шаблон:",
  ],
  skeptical: [
    "Надявам се наистина да се заемат;",
    "При подобни жалби рядко виждах резултат, но",
    "Не съм сигурен, че марката ще отговори тук,",
    "До официален отговор оставам резервиран;",
    "Изглежда работи различно от написаното —",
    "Звучи сериозно, има ли доказателства?",
  ],
  supportive: [
    "Следя случая,",
    "Добре е темата да остане видима;",
    "И аз щях да пиша всъщност,",
    "Очакваме прозрачно решение —",
    "Подкрепям те от общността,",
    "Прав си, важно е гласът ти да се чуе;",
  ],
  question: [
    "Получи ли писмен отговор от поддръжката?",
    "Сподели ли номера на поръчката?",
    "От колко дни си на този етап?",
    "Как точно направи {detail}?",
    "Добави ли снимка към жалбата?",
    "Пробва ли чат или имейл?",
  ],
  tip: [
    "В подобен случай документът и часът заедно помогнаха.",
    "Понякога пренасочването към друг отдел ускорява нещата.",
    "Запиши номера на жалбата — по-лесно се проследява.",
    "Добави и референцията от плащането, ако имаш.",
    "Сутрин писането ми донесе по-бърз отговор.",
    "Събери всичко в едно съобщение, за да няма объркване.",
  ],
  brief: [
    "Съчувствие, надявам се да се реши.",
    "+1, същата картина.",
    "Следя случая.",
    "И аз съм засегнат.",
    "Надявам се да отговорят бързо.",
    "Прав си, не мълчи.",
  ],
  experience: [
    "Миналия месец при {brand} чаках за {detail}; отне {days}.",
    "Имах подобен случай; накрая го решиха, но бавно.",
    "Приятел също се засече при същата фирма — {detail} е често.",
    "При мен проработи друг подход; може да ти свърши работа.",
    "Не е първи път — виждам подобни жалби за {brand}.",
    "И при мен имаше «{snippet}», почти същата формулировка.",
  ],
};

const STYLE_MIDDLES: Record<Topic, string[]> = {
  withdrawal: [
    "пратката да е „доставена“, а да я няма, е много дразнещо.",
    "без движение по проследяването човек се притеснява.",
    "да чакаш дни наред е стресиращо.",
    "закъснението без ясно обяснение е отделна тема.",
    "куриер или склад — резултатът е един и същ.",
  ],
  deposit: [
    "парите да са излезли, а да няма потвърждение, е трудно.",
    "плащането мина, а поръчката стои на изчакване.",
    "без фактура проследяването е мъка.",
    "с референтен номер е по-лесно да се търси.",
  ],
  bonus: [
    "когато условията се сменят после, доверието пада.",
    "обещана отстъпка, после „невалидна“ — често го виждам.",
    "връщането на сума да се бави е класика.",
  ],
  verification: [
    "докато чакаш проверка, всичко друго спира.",
    "да искат същия документ отново е изморително.",
    "пише „потвърдено“, а блокировката остава.",
  ],
  support: [
    "опашката в чата трае часове.",
    "всеки оператор разказва различна история.",
    "тикетът се затваря, решение няма.",
  ],
  account: [
    "когато профилът се заключи, става тревожно.",
    "цикълът с входа е нервиращ.",
    "SMS-ът да не идва е отделен проблем.",
  ],
  technical: [
    "приложението да се срива точно при поръчка е зле.",
    "ако сайтът и приложението показват различно, няма доверие.",
    "закачането на плащането е много дразнещо.",
  ],
  general: [
    "добре е такива проблеми да са видими.",
    "от марката се очаква ясно обяснение.",
    "процесът по решение трябва да е прозрачен.",
  ],
};

const STYLE_CLOSERS: Record<CommentStyle, string[]> = {
  empathy: [
    "Надявам се да се оправи възможно най-скоро.",
    "Ако има нова информация, пиши.",
    "И аз ще следя с теб.",
  ],
  frustrated: [
    "Вече се очаква сериозен отговор.",
    "Толкова забавяне не е нормално.",
    "Ако няма резултат, и аз ще пиша.",
  ],
  skeptical: [
    "Няма да коментирам преди официален отговор.",
    "Да видим какво ще кажат.",
    "Подобни обещания преди са оставали празни.",
  ],
  supportive: [
    "Подкрепям справедливите ти искания.",
    "Остани видим, не се отказвай.",
    "Ако има решение, пиши тук.",
  ],
  question: [
    "Любопитен съм, ще кажеш ли?",
    "Ако споделиш опита, ще е полезно.",
    "Какъв е последният статус?",
  ],
  tip: [
    "Пиша го, ако ти свърши работа.",
    "Ако пробваш, кажи какъв е резултатът.",
    "Успех.",
  ],
  brief: ["", "Успех.", "Съчувствие."],
  experience: [
    "Може при теб да стане по-бързо.",
    "Надявам се ти да го решиш по-рано.",
    "Да не повтарят същата грешка.",
  ],
};

const LEGACY_TEMPLATES: Record<Topic, string[]> = {
  withdrawal: [
    "При доставката чакам {detail}; заглавието «{snippet}» ми е много познато.",
    "Няма движение по проследяването, а пише завършено — същата картина.",
    "Закъсненията при {brand} вече са почти навик, за съжаление.",
    "Дойде известие, пратката я няма; и аз чакам за {detail}.",
    "Казват, че е на проверка, минаха {days}.",
  ],
  deposit: [
    "Плащането не се отрази; пробвах с {detail} — без резултат.",
    "Имам документ, няма потвърждение — «{snippet}» е точно моят случай.",
    "При {brand} системата често засича плащания.",
    "Плащането мина, статусът е нула; много дразнещо.",
  ],
  bonus: [
    "Темата с връщане/отстъпка е объркана; при {detail} е същото.",
    "Условията на промоцията наистина не са ясни.",
    "При {brand} често виждам отменени обещания.",
  ],
  verification: [
    "Докато проверката тече, всичко спира; качих документи и пак чакам.",
    "Без потвърждение няма движение — същият цикъл.",
    "{brand} прекалява с искането на документи.",
  ],
  support: [
    "Да стигнеш до поддръжка е отделна история; чакаш часове.",
    "Тикетът се затваря, решение няма — познато.",
    "Препращат към чат и после тишина.",
  ],
  account: [
    "Когато достъпът до профила изчезне, става паника; {detail} остана ли вътре?",
    "Имах цикъл при входа, много изморително.",
    "Без SMS код не може да се направи нищо.",
  ],
  technical: [
    "Приложението се срива; техническата страна е слаба.",
    "Приложението пада, сайтът показва друго — няма синхрон.",
    "И при {brand} имах закачане на поръчката.",
  ],
  general: [
    "Изглежда все повече хора имат подобен проблем.",
    "Очакваме прозрачно решение.",
    "Добре е темата да излезе наяве.",
    "Следя случая, надявам се да има резултат.",
  ],
};

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFrom<T>(arr: readonly T[], seed: number, salt: number): T {
  return arr[(seed + salt * 17) % arr.length];
}

function detectTopic(title: string, body: string, scenario?: string | null): Topic {
  const scenarioMap: Record<string, Topic> = {
    withdrawal: "withdrawal",
    deposit: "deposit",
    bonus: "bonus",
    free_spin: "bonus",
    verification: "verification",
    customer_support: "support",
    account: "account",
    technical: "technical",
    casino_game: "technical",
    sports_betting: "technical",
    payment: "deposit",
    delivery: "withdrawal",
    refund: "bonus",
  };
  if (scenario && scenario in scenarioMap) return scenarioMap[scenario];

  const t = `${title} ${body}`.toLocaleLowerCase("bg-BG");
  if (/достав|пратк|куриер|закъсн|не пристиг|изгуб|delivery|kargo/i.test(t)) return "withdrawal";
  if (/плащан|фактур|банков|карта|сума|deposit|havale/i.test(t)) return "deposit";
  if (/връщане|отстъпк|промоц|refund|bonus|кампани/i.test(t)) return "bonus";
  if (/документ|потвържд|верифик|verification|selfie/i.test(t)) return "verification";
  if (/поддръжк|чат|отговор|обаждан|тикет|support/i.test(t)) return "support";
  if (/профил|вход|акаунт|блокир|sms/i.test(t)) return "account";
  if (/приложение|сайт|технич|срив|бъг|app/i.test(t)) return "technical";
  return "general";
}

type CommentContext = {
  snippet: string;
  detail: string;
  days: string;
  brand: string;
};

function extractContext(title: string, body: string, brandName: string): CommentContext {
  const combined = `${title}. ${body}`.replace(/\s+/g, " ").trim();
  const snippetRaw = title.trim() || combined;
  const snippet =
    snippetRaw.length > 64 ? `${snippetRaw.slice(0, 61).trim()}…` : snippetRaw;

  const amount = combined.match(/\d[\d.,]*\s*(?:лв|bgn|eur|€|лева|usd)/i)?.[0]?.trim();
  const method = combined.match(
    /(?:наложен платеж|карта|revolut|paypal|банков превод|easypay|speedy|econt)/i,
  )?.[0]?.trim();
  const daysMatch = combined.match(/(\d+)\s*(?:дни|ден|часа|час|седмиц)/i);
  const days = daysMatch?.[0]?.trim() ?? `${3 + (hashSeed(combined) % 12)} дни`;

  const detailFallbacks = [
    amount ?? method ?? days,
    method ? `${method}` : undefined,
    amount ? `сума ${amount}` : undefined,
    "доставката",
    "плащането",
    "връщането",
    "проверката",
  ].filter(Boolean) as string[];

  const detail = detailFallbacks[hashSeed(combined) % detailFallbacks.length] ?? "поръчката";

  return { snippet, detail, days, brand: brandName };
}

function fillTemplate(template: string, ctx: CommentContext): string {
  return template
    .replace(/\{brand\}/g, ctx.brand)
    .replace(/\{snippet\}/g, ctx.snippet)
    .replace(/\{detail\}/g, ctx.detail)
    .replace(/\{days\}/g, ctx.days);
}

function buildProceduralComment(
  style: CommentStyle,
  topic: Topic,
  ctx: CommentContext,
  seed: number,
  slot: number,
): string {
  if (style === "brief") {
    const line = pickFrom(STYLE_OPENERS.brief, seed, slot);
    return fillTemplate(line, ctx).trim();
  }

  if (style === "question") {
    const q = pickFrom(STYLE_OPENERS.question, seed, slot);
    return fillTemplate(q, ctx).replace(/\?$/, "?");
  }

  if (style === "tip") {
    const tip = pickFrom(STYLE_OPENERS.tip, seed, slot);
    const mid = pickFrom(STYLE_MIDDLES[topic], seed, slot + 3);
    return `${tip} ${mid.charAt(0).toUpperCase()}${mid.slice(1)}`.replace(/\s+/g, " ").trim();
  }

  const opener = fillTemplate(pickFrom(STYLE_OPENERS[style], seed, slot), ctx);
  const middle = pickFrom(STYLE_MIDDLES[topic], seed, slot + 5);
  const closer = fillTemplate(pickFrom(STYLE_CLOSERS[style], seed, slot + 7), ctx);

  const parts = [opener, middle, closer].filter(Boolean);
  let text = parts.join(" ").replace(/\s+/g, " ").trim();
  text = text.replace(/\s+([,.!?])/g, "$1");
  if (!/[.!?]$/.test(text)) text += ".";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function revealDelayMs(complaintId: string, slot: number): number {
  const baseMin = REVEAL_BASE_MIN[slot] ?? REVEAL_BASE_MIN[REVEAL_BASE_MIN.length - 1];
  const h = hashSeed(`${complaintId}:reveal:${slot}`);
  const jitterMin = (h % 121) - 60;
  return Math.max(60, baseMin + jitterMin) * 60_000;
}

function pickBody(
  topic: Topic,
  style: CommentStyle,
  seed: number,
  slot: number,
  ctx: CommentContext,
  usedBodies: Set<string>,
): string {
  const attempts: string[] = [];

  attempts.push(buildProceduralComment(style, topic, ctx, seed, slot));

  const legacyPool = [...LEGACY_TEMPLATES[topic], ...LEGACY_TEMPLATES.general];
  const start = (seed + slot * 23) % legacyPool.length;
  for (let j = 0; j < legacyPool.length; j++) {
    attempts.push(fillTemplate(legacyPool[(start + j) % legacyPool.length], ctx));
  }

  const altStyles: CommentStyle[] = ["experience", "skeptical", "supportive", "frustrated"];
  for (const alt of altStyles) {
    if (alt === style) continue;
    attempts.push(buildProceduralComment(alt, topic, ctx, seed + slot, slot + 11));
  }

  for (const candidate of attempts) {
    const key = candidate.toLowerCase();
    if (candidate.length >= 12 && !usedBodies.has(key)) {
      usedBodies.add(key);
      return candidate;
    }
  }

  return attempts[0] ?? fillTemplate(legacyPool[0], ctx);
}

/** Коментари на общността, които се появяват поетапно в детайла на жалбата. */
export function generateScheduledPreviewComments(input: {
  complaintId: string;
  brandName: string;
  title: string;
  body: string;
  scenario?: string | null;
  complaintCreatedAt: Date | string;
  maxTotal?: number;
  avoidBodies?: string[];
  avoidNames?: string[];
  now?: Date;
}): TalkedPreviewComment[] {
  const maxTotal = Math.min(3, Math.max(0, input.maxTotal ?? 3));
  if (maxTotal === 0) return [];

  const created =
    input.complaintCreatedAt instanceof Date
      ? input.complaintCreatedAt
      : new Date(input.complaintCreatedAt);
  const now = input.now ?? new Date();
  const topic = detectTopic(input.title, input.body, input.scenario);
  const ctx = extractContext(input.title, input.body, input.brandName);
  const seed = hashSeed(input.complaintId);
  const usedBodies = new Set((input.avoidBodies ?? []).map((b) => b.trim().toLowerCase()));
  const usedNames = new Set((input.avoidNames ?? []).map((n) => n.trim().toLowerCase()));
  const out: TalkedPreviewComment[] = [];
  const slotLimit = REVEAL_BASE_MIN.length;

  for (let slot = 0; slot < slotLimit; slot++) {
    if (out.length >= maxTotal) break;
    const revealAt = new Date(created.getTime() + revealDelayMs(input.complaintId, slot));
    if (now.getTime() < revealAt.getTime()) continue;

    const style = SLOT_STYLES[slot] ?? pickFrom(
      ["empathy", "frustrated", "supportive", "experience", "question", "tip"] as CommentStyle[],
      seed,
      slot,
    );
    const body = pickBody(topic, style, seed, slot, ctx, usedBodies);
    const avoid = [...usedNames];
    let name = pickTurkishDisplayName(avoid);
    for (let k = 0; k < 8 && usedNames.has(name.toLowerCase()); k++) {
      avoid.push(name);
      name = pickTurkishDisplayName(avoid);
    }
    usedNames.add(name.toLowerCase());

    const postJitterMin = (hashSeed(`${input.complaintId}:post:${slot}`) % 45) + 3;
    const postedAt = new Date(revealAt.getTime() + postJitterMin * 60_000);
    const createdAt =
      postedAt.getTime() > now.getTime()
        ? revealAt.toISOString()
        : postedAt.toISOString();

    out.push({
      id: `preview-${input.complaintId.slice(0, 8)}-${slot}`,
      body,
      created_at: createdAt,
      profiles: { full_name: name, username: null },
    });
  }

  return out;
}

export function generateTalkedPreviewComments(input: {
  complaintId: string;
  brandName: string;
  title: string;
  body: string;
  scenario?: string | null;
  count: number;
  avoidBodies?: string[];
  avoidNames?: string[];
}): TalkedPreviewComment[] {
  return generateScheduledPreviewComments({
    ...input,
    complaintCreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60_000),
    maxTotal: input.count,
  });
}
