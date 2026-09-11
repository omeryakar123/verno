export function formatAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `преди ${s} сек.`;
  const m = Math.floor(s / 60);
  if (m < 60) return `преди ${m} мин.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `преди ${h} ч.`;
  const d = Math.floor(h / 24);
  return `преди ${d} д.`;
}

export function formatCounter(n: number, locale = "bg-BG"): string {
  return n.toLocaleString(locale);
}

/**
 * Marka puanı — 100 üzerinden.
 *
 * Yıldızlar yalnızca SONUÇLANAN şikayetlere verilir (memnun = 5, memnun
 * değil = 1, orta = 3-4). Bu 1–5 notların ortalaması 100'lük skalaya
 * çevrilir: skor = ortalama / 5 × 100. Hiç oy yoksa null → arayüz "—" gösterir.
 */
export function score100(
  rating: number | null | undefined,
  ratingCount: number | null | undefined,
): number | null {
  if (!ratingCount || ratingCount <= 0) return null;
  const r = Number(rating ?? 0);
  if (!Number.isFinite(r) || r <= 0) return null;
  return Math.round(Math.min(5, Math.max(0, r)) * 20);
}
