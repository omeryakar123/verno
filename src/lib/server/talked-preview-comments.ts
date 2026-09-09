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

/** Şikayet yayınlandıktan sonra yorumların görünme gecikmeleri (dakika). */
const REVEAL_BASE_MIN = [240, 1080, 4320] as const;

const SLOT_STYLES: CommentStyle[] = ["empathy", "frustrated", "supportive"];

const STYLE_OPENERS: Record<CommentStyle, string[]> = {
  empathy: [
    "Okurken içim sıkıştı,",
    "Gerçekten üzücü bir durum —",
    "Benzer bir süreçten geçtim,",
    "Umarım kısa sürede çözülür;",
    "Mağduriyetini anlıyorum,",
    "Bu kadar bekletmek kabul edilemez ama",
  ],
  frustrated: [
    "Yine mi aynı firma aynı bahane?",
    "Artık şaşırmıyorum bile,",
    "Bu konu {brand} tarafında sürekli tekrar ediyor;",
    "Cidden sıkıldım bu tür cevaplardan —",
    "Okuyunca sinirim bozuldu,",
    "Her seferinde aynı kalıp:",
  ],
  skeptical: [
    "Umarım gerçekten ilgilenirler;",
    "Daha önce benzer şikayetlerde pek sonuç görmedim ama",
    "Marka buradan cevap verir mi emin değilim,",
    "Resmi yanıt gelene kadar temkinliyim;",
    "SSS'te yazandan farklı işliyor gibi geliyor —",
    "İddialı ama kanıtlayıcı belge var mı acaba?",
  ],
  supportive: [
    "Takipteyim,",
    "Gündemde kalması iyi olur;",
    "Ben de yazacaktım aslında,",
    "Şeffaf çözüm bekliyoruz —",
    "Topluluk olarak destekliyorum,",
    "Haklısın, sesini duyurmak önemli;",
  ],
  question: [
    "Destekten yazılı dönüş aldın mı?",
    "İşlem numaranı paylaştın mı peki?",
    "Kaç gündür bu aşamadasın?",
    "Hangi yöntemle {detail} yapmıştın?",
    "Ekran görüntüsü ekledin mi şikayete?",
    "Canlı destek mi mail mi denedin?",
  ],
  tip: [
    "Benzer durumda dekont + saat bilgisini birlikte iletmek işe yaramıştı.",
    "Finans birimine yönlendirme istemek bazen hızlandırıyor.",
    "Şikayet numarasını not al; takip kolaylaşır.",
    "Bankadan alınan işlem referansını da ekle derim.",
    "Sabah saatlerinde yazmak daha hızlı yanıt getirmişti bana.",
    "Aynı konuyu tek mesajda toparlamak karışıklığı azaltıyor.",
  ],
  brief: [
    "Geçmiş olsun, umarım çözülür.",
    "+1, aynı tablo.",
    "Takipteyim.",
    "Ben de etkilendim.",
    "Umarım hızlı dönerler.",
    "Sesini duyur, haklısın.",
  ],
  experience: [
    "Geçen ay {brand} tarafında {detail} için ben de bekledim; {days} gün sürdü.",
    "Benzerini yaşamıştım; sonunda finans ekibi çözdü ama uzun sürdü.",
    "Arkadaşım da aynı firmada takıldı, {detail} konusu çok yaygın.",
    "Ben farklı bir yöntem deneyince düzelmişti; belki işine yarar.",
    "İlk kez değil — {brand} ile ilgili benzer şikayetler görüyorum.",
    "Benimkinde de «{snippet}» geçiyordu, neredeyse aynı cümle.",
  ],
};

const STYLE_MIDDLES: Record<Topic, string[]> = {
  withdrawal: [
    "çekim onaylandı yazıp para gelmemesi çok can sıkıcı.",
    "banka tarafında hareket yoksa panik oluyor insan.",
    "günlerdir beklemek zorunda kalmak stresli.",
    "limit düşürülmesi de ayrı tartışılır.",
    "havale/Papara fark etmez, sonuç aynı.",
  ],
  deposit: [
    "para çıktı hesaba girmedi mi gerçekten zor.",
    "3D onaylandı ama bakiye yok tuhaflık.",
    "yatırım askıda kalınca oyun da oynanmıyor.",
    "referans numarasıyla takip şart.",
  ],
  bonus: [
    "bonus şartları sonradan değişince güven kalmıyor.",
    "çevrim tamam denip silinmesi çok görüyorum.",
    "promosyon kodu geçersiz demeleri klasik.",
  ],
  verification: [
    "KYC uzayınca çekim de kilitleniyor.",
    "aynı belgeyi tekrar istemeleri yorucu.",
    "doğrulandı yazıp engel devam ediyor.",
  ],
  support: [
    "canlı destek kuyruğu saatler sürüyor.",
    "her temsilci farklı story anlatıyor.",
    "ticket kapatılıp çözüm yok.",
  ],
  account: [
    "hesap kilitlenince içerideki bakiye endişelendiriyor.",
    "giriş döngüsü sinir bozucu.",
    "SMS gelmemesi ayrı dert.",
  ],
  technical: [
    "oyun ortasında kopunca kazanç uçuyor.",
    "mobil/web bakiye tutmuyorsa kimseye güven olmaz.",
    "kupon donması can sıkıcı.",
  ],
  general: [
    "bu tür sorunların görünür olması iyi.",
    "markadan net açıklama beklenir.",
    "çözüm süreci şeffaf olmalı.",
  ],
};

const STYLE_CLOSERS: Record<CommentStyle, string[]> = {
  empathy: [
    "Umarım en kısa sürede hallolur.",
    "Güncelleme paylaşırsan sevinirim.",
    "Ben de seninle takip edeceğim.",
  ],
  frustrated: [
    "Artık ciddi bir dönüş beklenir bence.",
    "Bu kadar uzaması normal değil.",
    "Sonuç çıkmazsa ben de yazacağım.",
  ],
  skeptical: [
    "Resmi yanıtı görmeden yorum yapmayayım.",
    "Bakalım ne diyecekler.",
    "Geçmişte benzer vaatler boşa çıkmıştı.",
  ],
  supportive: [
    "Haklı taleplerini destekliyorum.",
    "Görünür kal, pes etme.",
    "Çözüm çıkarsa buradan da yaz lütfen.",
  ],
  question: [
    "Merak ettim, haber verir misin?",
    "Deneyimini paylaşırsan iyi olur.",
    "Son durum ne oldu?",
  ],
  tip: [
    "Belki işine yarar diye yazdım.",
    "Denersen sonucu merak ederim.",
    "Kolay gelsin.",
  ],
  brief: [
    "",
    "Kolay gelsin.",
    "Geçmiş olsun.",
  ],
  experience: [
    "Belki seninkinde daha hızlı olur.",
    "Umarım sen daha erken çözersin.",
    "Aynı hatayı tekrar etmesinler.",
  ],
};

const LEGACY_TEMPLATES: Record<Topic, string[]> = {
  withdrawal: [
    "Çekim tarafında {detail} bekliyorum; «{snippet}» başlığı birebir tanıdık.",
    "Banka ekstresinde hareket yok, sitede tamamlandı görünüyor — aynı tablo.",
    "{brand} çekiminde gecikme artık alışıldık oldu maalesef.",
    "Onay mesajı geldi param yok; {detail} için ben de bekliyorum.",
    "Finans birimi incelemede diyor, {days} gün oldu.",
  ],
  deposit: [
    "Yatırım hesaba geçmedi; {detail} ile denedim, olmadı.",
    "Dekont var bakiye yok — «{snippet}» tam benim yaşadığım.",
    "{brand} yatırımında sistem sık takılıyor gibi.",
    "3D geçti, bakiye sıfır; sinir bozucu.",
  ],
  bonus: [
    "Bonus/çevrim konusu karışık; {detail} tarafında benzer sorun.",
    "Kampanya şartları net değil dediğin gibi.",
    "Promosyon silinmesi çok görüyorum {brand} için.",
  ],
  verification: [
    "KYC uzayınca her şey kilitleniyor; evrak yükledim yine bekliyorum.",
    "Doğrulama bitmeyince çekim de yok — aynı döngü.",
    "{brand} belge isteme konusunda aşırı.",
  ],
  support: [
    "Destek hattına ulaşmak ayrı mesele; saatler bekliyorsun.",
    "Ticket kapanıyor çözüm yok — tanıdık.",
    "WhatsApp'a yönlendirip cevap yok klasik.",
  ],
  account: [
    "Hesap erişimi gidince panik oluyor; {detail} içeride kaldı mı?",
    "Giriş döngüsü yaşadım, çok yorucu.",
    "SMS doğrulama gelmeyince işlem yapılamıyor.",
  ],
  technical: [
    "Oyun/bahis kopunca kazanç uçuyor; teknik taraf zayıf.",
    "Uygulama çöküyor, web farklı — senkron yok.",
    "Kupon donması can sıkıcı, {brand} tarafında da oldu.",
  ],
  general: [
    "Benzer mağduriyet yaşayanlar artıyor gibi.",
    "Şeffaf çözüm bekliyoruz.",
    "Gündeme gelmesi iyi olmuş.",
    "Takip ediyorum, umarım sonuç alırsın.",
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
  };
  if (scenario && scenario in scenarioMap) return scenarioMap[scenario];

  const t = `${title} ${body}`.toLocaleLowerCase("tr-TR");
  if (/çekim|para çek|withdraw|ödeme al|havale.*gelmedi/i.test(t)) return "withdrawal";
  if (/yatır|deposit|bakiye.*geç|havale.*att/i.test(t)) return "deposit";
  if (/bonus|free spin|çevrim|promosyon|kampanya/i.test(t)) return "bonus";
  if (/kimlik|doğrul|verification|evrak|selfie/i.test(t)) return "verification";
  if (/destek|canlı|yanıt|müşteri hizmet|cevap yok/i.test(t)) return "support";
  if (/hesap|giriş|askı|kısıt|ban/i.test(t)) return "account";
  if (/oyun|bahis|kupon|bağlant|uygulama|teknik/i.test(t)) return "technical";
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

  const amount = combined.match(/\d[\d.,]*\s*(?:tl|₺|lira|usd|usdt|dolar)/i)?.[0]?.trim();
  const method = combined.match(
    /(?:papara|payfix|havale|eft|fast|kripto|bitcoin|usdt|mefete|payco|tether|banka)/i,
  )?.[0]?.trim();
  const daysMatch = combined.match(/(\d+)\s*(?:gün|saat|hafta)/i);
  const days = daysMatch?.[0]?.trim() ?? `${3 + (hashSeed(combined) % 12)} gün`;

  const detailFallbacks = [
    amount ?? method ?? days,
    method ? `${method} işlemi` : undefined,
    amount ? `${amount} tutarında işlem` : undefined,
    "çekim talebi",
    "yatırım işlemi",
    "bonus tanımı",
    "doğrulama süreci",
  ].filter(Boolean) as string[];

  const detail = detailFallbacks[hashSeed(combined) % detailFallbacks.length] ?? "işlem";

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

/** Şikayet detayında kademeli görünen topluluk yorumları. */
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

/** Geriye dönük uyumluluk. */
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
