/**
 * Platformu işleten tüzel kişi — tek kaynak.
 *
 * Bulgaristan'da bir web sitesi işletmek için kimlik bilgilerinin sitede
 * erişilebilir olması zorunludur:
 *   - ЗЕТ (Закон за електронната търговия) чл. 4 — sağlayıcı kimliği: unvan,
 *     ЕИК, tescilli adres, iletişim.
 *   - GDPR md. 13 — veri sorumlusunun kimliği ve КЗЛД'ye şikayet hakkı.
 *
 * TESCİL SONRASI YAPILACAK: aşağıdaki alanları doldur ve `LEGAL_ENTITY_READY`
 * değerini `true` yap. Bayrak `false` olduğu sürece yasal sayfalarda kimlik
 * bloğu yerine "hazırlanıyor" notu gösterilir — böylece site boş yerine
 * dürüst bir şey söyler ve uydurma tescil bilgisi yayınlanmaz.
 */

export const LEGAL_ENTITY_READY = false;

export const LEGAL_ENTITY = {
  /** Ticaret siciline kayıtlı tam unvan, ör. "Верно ЕООД". */
  name: "",
  /** ЕИК / БУЛСТАТ (tek kimlik kodu). */
  eik: "",
  /** ДДС numarası — KDV'ye kayıtlıysa. */
  vat: "",
  /** Tescilli adres (седалище и адрес на управление). */
  address: "",
  /** Temsilci (управител). */
  representative: "",
  /** Veri koruma iletişim adresi — ayrı DPO yoksa genel adres. */
  dataContactEmail: "info@verno.bg",
} as const;

/** Kişisel veri denetim otoritesi — GDPR md. 13(2)(d) gereği bildirilir. */
export const DATA_PROTECTION_AUTHORITY = {
  name: "Комисия за защита на личните данни (КЗЛД)",
  address: "гр. София 1592, бул. „Проф. Цветан Лазаров“ № 2",
  website: "https://www.cpdp.bg",
} as const;

/** Tüketici koruma otoritesi — uyuşmazlık yolu olarak bildirilir. */
export const CONSUMER_PROTECTION_AUTHORITY = {
  name: "Комисия за защита на потребителите (КЗП)",
  website: "https://kzp.bg",
} as const;

/**
 * Yasal sayfalarda gösterilecek işletmeci kimliği satırları.
 * Tescil tamamlanmadıysa boş dizi döner.
 */
export function legalEntityLines(): string[] {
  if (!LEGAL_ENTITY_READY) return [];
  const e = LEGAL_ENTITY;
  return [
    `Фирма: ${e.name}`,
    `ЕИК: ${e.eik}`,
    ...(e.vat ? [`ДДС №: ${e.vat}`] : []),
    `Седалище и адрес на управление: ${e.address}`,
    ...(e.representative ? [`Представляващ: ${e.representative}`] : []),
    `Контакт: ${e.dataContactEmail}`,
  ];
}

/** Kimlik bloğu yerine gösterilecek dürüst ara metin. */
export const LEGAL_ENTITY_PENDING_NOTE =
  "Данните за търговската регистрация на оператора се публикуват тук след вписване в Търговския регистър.";
