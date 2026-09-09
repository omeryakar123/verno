/** Prod script'leri için — veri scripts/telegram-brand-channels.json (tek kaynak). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dir, "telegram-brand-channels.json"), "utf8");
export const TELEGRAM_BRAND_CHANNELS = JSON.parse(raw);
