/**
 * Marka slug → Telegram kanal kullanıcı adı.
 * Veri: scripts/telegram-brand-channels.json (logo script'leriyle paylaşılır).
 */
import channels from "../../scripts/telegram-brand-channels.json";

export const TELEGRAM_BRAND_CHANNELS: Record<string, string> = channels;
