#!/usr/bin/env node
/**
 * Coolify uygulamasına Resend OTP mail ortam değişkenlerini yazar.
 *
 * Kullanım:
 *   COOLIFY_TOKEN='1|...' RESEND_API_KEY='re_...' node scripts/coolify-set-resend-env.mjs
 *   COOLIFY_TOKEN='1|...' RESEND_API_KEY='re_...' node scripts/coolify-set-resend-env.mjs --restart
 *   COOLIFY_TOKEN='1|...' RESEND_API_KEY='re_...' node scripts/coolify-set-resend-env.mjs --deploy
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

const RESEND_KEYS = [
  "EMAIL_PROVIDER",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "EMAIL_FROM",
];

/** Eski Brevo SMTP env'lerini temizlemek için boş değer gönderilir. */
const CLEAR_SMTP_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
];

function loadSelfhost() {
  const p = resolve(__dir, "../.env.selfhost");
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function pick(key, sh, fallback = "") {
  return (process.env[key] ?? sh[key] ?? fallback).trim();
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

function envEntry(key, value, uuid) {
  const row = {
    key,
    value,
    is_literal: true,
    is_runtime: true,
    is_buildtime: false,
  };
  if (uuid) row.uuid = uuid;
  return row;
}

async function main() {
  if (!TOKEN) {
    console.error("COOLIFY_TOKEN tanımlı değil");
    process.exit(1);
  }

  const sh = loadSelfhost();
  const values = {
    EMAIL_PROVIDER: pick("EMAIL_PROVIDER", sh, "resend"),
    RESEND_API_KEY: pick("RESEND_API_KEY", sh),
    RESEND_FROM_EMAIL: pick("RESEND_FROM_EMAIL", sh, "tepkimvar <info@tepkimvar.net>"),
    EMAIL_FROM: pick("EMAIL_FROM", sh, "tepkimvar <info@tepkimvar.net>"),
  };

  if (!values.RESEND_API_KEY) {
    console.error("RESEND_API_KEY (.env.selfhost veya env) tanımlı değil");
    process.exit(1);
  }

  const existing = await api(`/applications/${APP}/envs`);
  const byKey = new Map();
  for (const row of existing) {
    const allKeys = [...RESEND_KEYS, ...CLEAR_SMTP_KEYS];
    if (!allKeys.includes(row.key)) continue;
    if (!byKey.has(row.key)) byKey.set(row.key, []);
    byKey.get(row.key).push(row);
  }

  const duplicateUuids = [];
  for (const [, rows] of byKey) {
    rows.slice(1).forEach((r) => duplicateUuids.push(r.uuid));
  }

  if (duplicateUuids.length) {
    console.log(`${duplicateUuids.length} yinelenen mail env siliniyor...`);
    for (const uuid of duplicateUuids) {
      try {
        await api(`/applications/${APP}/envs/${uuid}`, { method: "DELETE" });
      } catch (e) {
        console.warn(`  Silinemedi ${uuid}:`, e.message);
      }
    }
  }

  const vars = [];
  for (const key of RESEND_KEYS) {
    const val = values[key];
    if (!val) continue;
    const keep = byKey.get(key)?.[0];
    vars.push(envEntry(key, val, keep?.uuid));
  }

  for (const key of CLEAR_SMTP_KEYS) {
    const keep = byKey.get(key)?.[0];
    if (keep) vars.push(envEntry(key, "", keep.uuid));
  }

  console.log(`Resend env güncelleniyor (${vars.length} değişken)...`);
  console.log(`  EMAIL_PROVIDER=${values.EMAIL_PROVIDER}`);
  console.log(`  RESEND_FROM_EMAIL=${values.RESEND_FROM_EMAIL}`);
  console.log(`  EMAIL_FROM=${values.EMAIL_FROM}`);
  console.log(`  RESEND_API_KEY=***${values.RESEND_API_KEY.slice(-4)}`);
  console.log("  SMTP_* temizleniyor (Brevo devre dışı)");

  await api(`/applications/${APP}/envs/bulk`, {
    method: "PATCH",
    body: JSON.stringify({ data: vars }),
  });

  console.log("Güncellendi:", vars.map((v) => v.key).join(", "));

  if (DEPLOY) {
    console.log("\nDeploy tetikleniyor...");
    const out = await api("/deploy", { method: "POST", body: JSON.stringify({ uuid: APP, force: true }) });
    console.log("Deploy:", out);
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
    console.log("\nEnv aktif olması için: node scripts/coolify-set-resend-env.mjs --restart");
    console.log("Kod deploy (git push sonrası): node scripts/coolify-set-resend-env.mjs --deploy");
  }
}

main().catch((e) => {
  console.error(e.message);
  if (String(e.message).includes("403")) {
    console.error("\nToken yetkisi yetersiz. Coolify → API Tokens → 'Update Environments' + 'Deploy' işaretleyin.");
  }
  process.exit(1);
});
