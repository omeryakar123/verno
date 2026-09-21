/**
 * Bağımlılıksız HTTP yardımcıları: hata tipi, istemci IP'si, rate limit.
 *
 * `guard.ts`'ten ayrı tutulur çünkü o dosya veritabanı ve Better Auth çeker;
 * buradaki saf mantık böylece test edilebilir ve hafif kalır.
 */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Sabit pencereli sayaç. Aynı `key` için `windowMs` içinde en fazla `limit`
 * istek; aşılırsa 429 fırlatır.
 *
 * NOT: Sayaç süreç belleğindedir. Birden fazla instance çalıştırılırsa her
 * instance kendi sayacını tutar ve etkin limit instance sayısıyla çarpılır;
 * her deploy'da da sıfırlanır. Tek instance kurulumunda yeterlidir.
 */
export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (b.count >= limit) {
    const secs = Math.ceil((b.resetAt - now) / 1000);
    throw new HttpError(
      429,
      `Твърде много заявки. Опитайте отново след ${secs} сек.`,
    );
  }
  b.count++;
}

/** Yalnızca testler için: sayaçları sıfırla. */
export function __resetRateLimits(): void {
  buckets.clear();
}

// Bellek sızıntısını önle: süresi dolmuş kayıtları ara sıra temizle.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}, 60_000).unref?.();
