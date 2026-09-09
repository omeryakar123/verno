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
