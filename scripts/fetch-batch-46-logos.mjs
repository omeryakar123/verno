#!/usr/bin/env node
/**
 * 46'lık marka batch için Telegram / favicon logolarını public/brand-logos/ altına indirir
 * ve manual-brand-logos.ts günceller.
 *
 *   node scripts/fetch-batch-46-logos.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const OUT = join(ROOT, "public/brand-logos");
const TS_OUT = join(ROOT, "src/lib/manual-brand-logos.ts");

const BATCH_SLUGS = [
  "betkare", "nesine-casino", "rekabet-operations", "lord-palace-casino", "kralbet",
  "bigbro-casino", "matadorbet", "yorkbet", "betsat", "sunbahis", "turboslot", "norabahis",
  "trbetgit", "netx-casino", "milbet", "betorder", "globalbahis", "hititbet", "royalbet360",
  "bahislion", "bahisnow", "casinoslot", "betvakti", "rossibet", "betoffice", "galabet",
  "maksibet", "betpark", "kolaybet", "olabahis", "tipobet365", "adaxbet", "neyine", "ilbet",
  "betgaranti", "milanobet", "underoverbet", "betandyou", "galaxy-betting", "polo", "hovarda",
  "madridbet", "betchip", "betroad", "mrking", "sparkent",
];

const DOMAIN = {
  "nesine-casino": "nesine.com",
  "rekabet-operations": "rekabet.com",
  "lord-palace-casino": "lordpalacecasino.com",
  "bigbro-casino": "bigbrocasino.com",
  "netx-casino": "netxcasino.com",
  "galaxy-betting": "galaxybetting.com",
  underoverbet: "underoverbet.com",
  mrking: "mrking.com",
  polo: "polobet.com",
};

const { TELEGRAM_BRAND_CHANNELS } = await import("./telegram-brand-channels.mjs");
const { fetchTelegramLogo } = await import("./lib/telegram-logo.mjs");

const UA = { "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36" };

async function fetchFavicon(slug) {
  const dom = DOMAIN[slug] ?? `${slug.replace(/-/g, "")}.com`;
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

mkdirSync(OUT, { recursive: true });

const existingTs = readFileSync(TS_OUT, "utf8");
const existingMap = {};
for (const m of existingTs.matchAll(/"([^"]+)":\s*"(\/brand-logos\/[^"]+)"/g)) {
  existingMap[m[1]] = m[2];
}

let ok = 0;
let fail = 0;

for (const slug of BATCH_SLUGS) {
  const dest = join(OUT, `${slug}.png`);
  if (existsSync(dest) && statSync(dest).size > 500) {
    existingMap[slug] = `/brand-logos/${slug}.png`;
    console.log(`  ATLA ${slug} (zaten var)`);
    ok++;
    continue;
  }

  const tg = await fetchTelegramLogo(slug, 800);
  const hit = tg ?? (await fetchFavicon(slug));
  if (!hit?.buf?.length) {
    console.warn(`  YOK ${slug}`);
    fail++;
    continue;
  }
  writeFileSync(dest, hit.buf);
  existingMap[slug] = `/brand-logos/${slug}.png`;
  console.log(`  OK   ${slug} (${hit.src}, ${hit.buf.length}b)`);
  ok++;
}

const lines = Object.entries(existingMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, url]) => `  "${slug}": "${url}",`)
  .join("\n");

writeFileSync(
  TS_OUT,
  `/** Otomatik üretildi — scripts/import-manual-brand-logos.mjs / fetch-batch-46-logos.mjs */\nexport const MANUAL_BRAND_LOGOS: Record<string, string> = {\n${lines}\n};\n`,
);

console.log(`\nBitti: ${ok} logo, ${fail} bulunamadı.`);
