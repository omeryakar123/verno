#!/usr/bin/env node
/**
 * Coolify uygulamasına OAuth runtime + build env'lerini yazar ve isteğe bağlı deploy tetikler.
 *
 * Kullanım:
 *   COOLIFY_TOKEN='1|...' GOOGLE_CLIENT_ID='...' GOOGLE_CLIENT_SECRET='...' node scripts/coolify-set-oauth-env.mjs
 *   COOLIFY_TOKEN='1|...' node scripts/coolify-set-oauth-env.mjs --restart
 *   COOLIFY_TOKEN='1|...' node scripts/coolify-set-oauth-env.mjs --deploy
 *
 * .env / .env.selfhost içindeki GOOGLE_* değerleri de okunur.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.COOLIFY_TOKEN;
const APP = process.env.COOLIFY_APP_UUID || "xqqcmqdtdbpqcieqafypp28o";
const BASE = (process.env.COOLIFY_URL || "http://131.123.39.95:8000").replace(/\/$/, "") + "/api/v1";
const RESTART = process.argv.includes("--restart");
const DEPLOY = process.argv.includes("--deploy");

const RUNTIME_KEYS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "APPLE_CLIENT_ID",
  "APPLE_CLIENT_SECRET",
  "APPLE_APP_BUNDLE_IDENTIFIER",
];

const BUILD_KEYS = [
  "VITE_OAUTH_GOOGLE",
  "VITE_OAUTH_FACEBOOK",
  "VITE_OAUTH_APPLE",
  "VITE_GOOGLE_ENABLED",
  "VITE_SITE_URL",
];

const ALL_KEYS = [...RUNTIME_KEYS, ...BUILD_KEYS];

function loadDotEnv(name) {
  const p = resolve(__dir, "..", name);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function pick(key, files, fallback = "") {
  return (process.env[key] ?? files[key] ?? fallback).trim();
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${opts.method || "GET"} ${path} -> ${res.status}: ${String(JSON.stringify(data)).slice(0, 400)}`);
  }
  return data;
}

function envEntry(key, value, uuid, { build = false, runtime = true } = {}) {
  const row = {
    key,
    value,
    is_literal: true,
    is_runtime: runtime,
    is_buildtime: build,
  };
  if (uuid) row.uuid = uuid;
  return row;
}

async function main() {
  if (!TOKEN) {
    console.error("COOLIFY_TOKEN tanımlı değil");
    process.exit(1);
  }

  const files = { ...loadDotEnv(".env.selfhost"), ...loadDotEnv(".env") };

  const values = {
    GOOGLE_CLIENT_ID: pick("GOOGLE_CLIENT_ID", files),
    GOOGLE_CLIENT_SECRET: pick("GOOGLE_CLIENT_SECRET", files),
    FACEBOOK_CLIENT_ID: pick("FACEBOOK_CLIENT_ID", files),
    FACEBOOK_CLIENT_SECRET: pick("FACEBOOK_CLIENT_SECRET", files),
    APPLE_CLIENT_ID: pick("APPLE_CLIENT_ID", files),
    APPLE_CLIENT_SECRET: pick("APPLE_CLIENT_SECRET", files),
    APPLE_APP_BUNDLE_IDENTIFIER: pick("APPLE_APP_BUNDLE_IDENTIFIER", files),
    VITE_OAUTH_GOOGLE: pick("VITE_OAUTH_GOOGLE", files, "true"),
    VITE_OAUTH_FACEBOOK: pick("VITE_OAUTH_FACEBOOK", files, "false"),
    VITE_OAUTH_APPLE: pick("VITE_OAUTH_APPLE", files, "false"),
    VITE_GOOGLE_ENABLED: pick("VITE_GOOGLE_ENABLED", files, "true"),
    VITE_SITE_URL: pick("VITE_SITE_URL", files, "https://tepkimvar.com"),
  };

  if (!values.GOOGLE_CLIENT_ID || !values.GOOGLE_CLIENT_SECRET) {
    console.error("GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET gerekli (.env veya env)");
    process.exit(1);
  }

  const existing = await api(`/applications/${APP}/envs`);
  const byKey = new Map();
  for (const row of existing) {
    if (!ALL_KEYS.includes(row.key)) continue;
    if (!byKey.has(row.key)) byKey.set(row.key, []);
    byKey.get(row.key).push(row);
  }

  const duplicateUuids = [];
  for (const [, rows] of byKey) {
    rows.slice(1).forEach((r) => duplicateUuids.push(r.uuid));
  }

  if (duplicateUuids.length) {
    console.log(`${duplicateUuids.length} yinelenen OAuth env siliniyor...`);
    for (const uuid of duplicateUuids) {
      try {
        await api(`/applications/${APP}/envs/${uuid}`, { method: "DELETE" });
      } catch (e) {
        console.warn(`  Silinemedi ${uuid}:`, e.message);
      }
    }
  }

  const vars = [];
  for (const key of RUNTIME_KEYS) {
    const val = values[key];
    if (!val) continue;
    vars.push(envEntry(key, val, byKey.get(key)?.[0]?.uuid, { runtime: true, build: false }));
  }

  for (const key of BUILD_KEYS) {
    const val = values[key];
    if (!val) continue;
    vars.push(envEntry(key, val, byKey.get(key)?.[0]?.uuid, { runtime: false, build: true }));
  }

  console.log(`OAuth env güncelleniyor (${vars.length} değişken)...`);
  console.log(`  GOOGLE_CLIENT_ID=${values.GOOGLE_CLIENT_ID.slice(0, 12)}...`);
  console.log(`  GOOGLE_CLIENT_SECRET=***${values.GOOGLE_CLIENT_SECRET.slice(-4)}`);
  console.log(`  VITE_OAUTH_GOOGLE=${values.VITE_OAUTH_GOOGLE}`);
  console.log(`  VITE_GOOGLE_ENABLED=${values.VITE_GOOGLE_ENABLED}`);

  await api(`/applications/${APP}/envs/bulk`, {
    method: "PATCH",
    body: JSON.stringify({ data: vars }),
  });

  console.log("Güncellendi:", vars.map((v) => v.key).join(", "));

  if (DEPLOY) {
    console.log("\nDeploy tetikleniyor...");
    try {
      const out = await api("/deploy", { method: "POST", body: JSON.stringify({ uuid: APP, force: true }) });
      console.log("Deploy:", out);
    } catch (e) {
      console.warn("Deploy API yetkisi yok — Coolify UI → tepkimvar → Deploy (Force rebuild)");
      console.warn(String(e.message || e));
    }
    return;
  }

  if (RESTART) {
    console.log("\nUygulama yeniden başlatılıyor...");
    try {
      const out = await api(`/applications/${APP}/restart`, { method: "POST" });
      console.log("Restart:", out);
    } catch (e) {
      console.warn("Restart API yetkisi yok — Coolify UI → tepkimvar → Restart");
      console.warn(String(e.message || e));
    }
  } else {
    console.log("\nVITE_* için rebuild: node scripts/coolify-set-oauth-env.mjs --deploy");
    console.log("Runtime env için: node scripts/coolify-set-oauth-env.mjs --restart");
  }
}

main().catch((e) => {
  console.error(e.message);
  if (String(e.message).includes("403")) {
    console.error("\nToken yetkisi yetersiz. Coolify → API Tokens → 'Update Environments' + 'Deploy' işaretleyin.");
  }
  process.exit(1);
});
