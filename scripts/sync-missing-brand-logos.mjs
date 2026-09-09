#!/usr/bin/env bun
/**
 * Logosu eksik/bozuk markaları bulur, Telegram/favicon ile indirir,
 * public/brand-logos/ + manual-brand-logos.ts + (opsiyonel) DB günceller.
 *
 *   bun scripts/sync-missing-brand-logos.mjs
 *   bun scripts/sync-missing-brand-logos.mjs --db
 */
import postgres from "postgres";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTelegramLogo } from "./lib/telegram-logo.mjs";
import { DOMAIN_OVERRIDES } from "./brand-domain-overrides.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const OUT = join(ROOT, "public/brand-logos");
const TS_OUT = join(ROOT, "src/lib/manual-brand-logos.ts");
const updateDb = process.argv.includes("--db");

const BAD = [
  "ui-avatars.com",
  "unavatar.io",
  "placeholder",
  "logo.clearbit.com",
  "superbonus14.pro",
  "google.com/s2/favicons",
  "gstatic.com/favicon",
  "duckduckgo.com/ip3",
];

const UA = { "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36" };

function isManualUpload(url) {
  const u = (url ?? "").trim().toLowerCase();
  if (!u) return false;
  if (u.startsWith("/brand-logos/") && !u.includes("/seed/")) return true;
  return u.startsWith("/api/files/brand-logos/") && !u.includes("/seed/");
}

function isBad(url) {
  if (isManualUpload(url)) return false;
  const u = (url ?? "").trim().toLowerCase();
  if (!u) return true;
  return BAD.some((p) => u.includes(p));
}

function domainFor(slug, website) {
  if (DOMAIN_OVERRIDES[slug]) return DOMAIN_OVERRIDES[slug];
  if (website) {
    let d = website.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
    d = d.split("/")[0].split("?")[0];
    if (d.includes(".")) return d;
  }
  return `${slug.replace(/-/g, "")}.com`;
}

async function fetchFavicon(slug, website) {
  const dom = domainFor(slug, website);
  const url = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${dom}`)}&size=256`;
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const ct = (r.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.includes("image")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 400) return null;
    return { buf, type: ct.split(";")[0] || "image/png", src: "favicon" };
  } catch {
    return null;
  }
}

if (!process.env.DATABASE_URL && updateDb) {
  console.error("DATABASE_URL gerekli (--db)");
  process.exit(1);
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

let rows = [];
if (process.env.DATABASE_URL) {
  const sql = postgres(process.env.DATABASE_URL, { max: 3 });
  rows = await sql`
    SELECT slug, name, website, logo_url FROM brands WHERE is_active = true ORDER BY slug
  `;
  await sql.end();
} else {
  console.warn("DATABASE_URL yok — yalnızca mevcut manual-brand-logos.ts kullanılacak");
}

const needFix = rows.filter((r) => isBad(r.logo_url));
console.log(`Aktif marka: ${rows.length}, logo düzeltilecek: ${needFix.length}`);

let ok = 0;
let fail = 0;
let dbUpdated = 0;

for (const row of needFix) {
  const slug = row.slug;
  const dest = join(OUT, `${slug}.png`);

  if (existsSync(dest) && statSync(dest).size > 500) {
    existingMap[slug] = `/brand-logos/${slug}.png`;
    ok++;
    console.log(`  ATLA ${slug} (dosya var)`);
    continue;
  }

  const tg = await fetchTelegramLogo(slug, 800);
  const hit = tg ?? (await fetchFavicon(slug, row.website));
  if (!hit?.buf?.length) {
    fail++;
    console.warn(`  YOK  ${slug}`);
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
  `/** Otomatik üretildi — scripts/sync-missing-brand-logos.mjs */\nexport const MANUAL_BRAND_LOGOS: Record<string, string> = {\n${lines}\n};\n`,
);

if (updateDb && process.env.DATABASE_URL) {
  const sql = postgres(process.env.DATABASE_URL, { max: 3 });
  for (const row of needFix) {
    const url = existingMap[row.slug];
    if (!url) continue;
    if (isManualUpload(row.logo_url)) continue;
    const res = await sql`
      UPDATE brands SET logo_url = ${url}, updated_at = now()
      WHERE slug = ${row.slug} AND (logo_url IS NULL OR logo_url <> ${url})
    `;
    if (res.count) dbUpdated++;
  }
  await sql.end();
}

console.log(`\nBitti: ${ok} logo hazır, ${fail} bulunamadı${updateDb ? `, DB: ${dbUpdated}` : ""}`);
