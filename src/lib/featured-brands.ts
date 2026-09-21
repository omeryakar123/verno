/**
 * Listelerde öne sabitlenen markalar.
 *
 * Eski tepkimvar kurulumu burada ~220 Türk bahis/casino slug'ı taşıyordu ve
 * bunlar `/api/brands`, `/api/brands/trend` ve anasayfa «Най-обсъждани»
 * bloğunda listelerin en üstüne pinleniyordu. Bulgar tüketici platformunda
 * hem konu dışı hem de lisanssız kumar operatörleriyle çağrışım riski
 * taşıdığı için liste boşaltıldı.
 *
 * Doldurmak istersen: gerçek marka slug'larını (DB'deki `brands.slug`) sırayla
 * yaz. Sıra önemlidir — dizideki index sıralama önceliğidir. Boş bırakmak
 * güvenli varsayılandır: markalar doğal metriklerine göre sıralanır.
 */
export const PRIORITY_BRAND_SLUGS: readonly string[] = [];

/** Anasayfa «Най-обсъждани» + Trend 100 — her zaman görünmesi gereken markalar. */
export const TALKED_PRIORITY_BRAND_SLUGS: readonly string[] = [];
