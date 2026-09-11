#!/usr/bin/env node
/**
 * Bulgaristan / genel tüketici markaları için logo indirir.
 * Kaynak sırası: site apple-touch-icon → Google faviconV2 → DuckDuckGo ip3.
 *
 *   node scripts/fetch-bg-brand-logos.mjs
 *   node scripts/fetch-bg-brand-logos.mjs --db   # DATABASE_URL gerekir
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const OUT = join(ROOT, "public/brand-logos");
const TS_OUT = join(ROOT, "src/lib/manual-brand-logos.ts");
const updateDb = process.argv.includes("--db");

/** slug → gerçek domain (Bulgaristan odaklı + demo markalar). */
const BRANDS = {
  telenor: "yettel.bg",
  emag: "emag.bg",
  "dsk-bank": "dskbank.bg",
  technopolis: "technopolis.bg",
  speedy: "speedy.bg",
  a1: "a1.bg",
  "wizz-air": "wizzair.com",
  lidl: "lidl.bg",
  unicredit: "unicreditbulbank.bg",
  econt: "econt.com",
  vivacom: "vivacom.bg",
  booking: "booking.com",
  trendyol: "trendyol.com",
  hepsiburada: "hepsiburada.com",
  turkcell: "turkcell.com.tr",
  "turk-telekom": "turktelekom.com.tr",
  vodafone: "vodafone.com.tr",
  migros: "migros.com.tr",
  arcelik: "arcelik.com.tr",
  thy: "turkishairlines.com",
};

const UA = { "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36" };

async function download(url, minBytes = 600) {
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const ct = (r.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.includes("image") && !url.endsWith(".ico")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < minBytes) return null;
    return { buf, type: ct.split(";")[0] || "image/png" };
  } catch {
    return null;
  }
}

async function fetchLogo(slug, domain) {
  for (const path of ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/favicon.ico"]) {
    const hit = await download(`https://${domain}${path}`, 800);
    if (hit) return { ...hit, src: "site" };
  }

  const gstatic = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=256`;
  const fav = await download(gstatic, 400);
  if (fav) return { ...fav, src: "gstatic" };

  const ddg = await download(`https://icons.duckduckgo.com/ip3/${domain}.ico`, 300);
  if (ddg) return { ...ddg, src: "ddg" };

  return null;
}

mkdirSync(OUT, { recursive: true });

let existingMap = {};
try {
  const existingTs = readFileSync(TS_OUT, "utf8");
  for (const m of existingTs.matchAll(/"([^"]+)":\s*"(\/brand-logos\/[^"]+)"/g)) {
    existingMap[m[1]] = m[2];
  }
} catch {
  existingMap = {};
}

let ok = 0;
let skip = 0;
let fail = 0;

for (const [slug, domain] of Object.entries(BRANDS)) {
  const dest = join(OUT, `${slug}.png`);
  if (existsSync(dest) && statSync(dest).size > 800) {
    existingMap[slug] = `/brand-logos/${slug}.png`;
    skip++;
    console.log(`  ATLA ${slug} (dosya var)`);
    continue;
  }

  const hit = await fetchLogo(slug, domain);
  if (!hit) {
    fail++;
    console.warn(`  YOK  ${slug} (${domain})`);
    continue;
  }

  writeFileSync(dest, hit.buf);
  existingMap[slug] = `/brand-logos/${slug}.png`;
  ok++;
  console.log(`  OK   ${slug} (${hit.src}, ${hit.buf.length}b)`);
}

const lines = Object.entries(existingMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, url]) => `  "${slug}": "${url}",`)
  .join("\n");

writeFileSync(
  TS_OUT,
  `/** Otomatik üretildi — scripts/fetch-bg-brand-logos.mjs + sync-missing-brand-logos.mjs */\nexport const MANUAL_BRAND_LOGOS: Record<string, string> = {\n${lines}\n};\n`,
);

let dbUpdated = 0;
if (updateDb && process.env.DATABASE_URL) {
  const sql = postgres(process.env.DATABASE_URL, { max: 3 });
  for (const [slug, url] of Object.entries(existingMap)) {
    if (!BRANDS[slug]) continue;
    const res = await sql`
      UPDATE brands SET logo_url = ${url}, updated_at = now()
      WHERE slug = ${slug} AND (logo_url IS NULL OR logo_url <> ${url})
    `;
    if (res.count) dbUpdated++;
  }
  await sql.end();
}

console.log(`\nBitti: ${ok} indirildi, ${skip} atlandı, ${fail} bulunamadı${updateDb ? `, DB: ${dbUpdated}` : ""}`);
