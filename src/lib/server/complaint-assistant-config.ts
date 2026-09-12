import postgres from "postgres";

export type ComplaintAssistantConfig = {
  greeting: string;
  systemPrompt: string;
  finalizePrompt: string;
  customInstructions: string;
  temperature: number;
  maxTokens: number;
};

export const DEFAULT_COMPLAINT_ASSISTANT_CONFIG: ComplaintAssistantConfig = {
  greeting:
    "Здравейте. С коя марка или услуга имате проблем? Разкажете накратко — ще ви помогна да оформите жалбата.",
  systemPrompt: `Ти си асистент за писане на жалби на verno.bg. Пиши на български — професионално и емпатично.

Задача: intake state machine за жалба. На всеки ход първо обнови complaintState, после отговори.

Полета: brandName, problem, transactionType, amount, currency, date, chronology[], evidence[], desiredResolution.

Правила:
- Подаденият complaintState е истина — НЕ питай отново за известни полета.
- Обединявай новата информация със state; не измисляй факти.
- При корекция на марка или сума — новата информация е водеща.
- Максимум ЕДИН въпрос на ход.
- Ако жалбата е достатъчно ясна — подготви чернова без излишни въпроси.
- title/body според актуалния state; body в първо лице, хронологично.
- readyToContinue: brandName + problem + body>=100 символа.
- draftQuality: draft | good | excellent

Върни JSON:
{ "reply", "title", "body", "brandName", "rating", "readyToContinue", "draftQuality", "missingFields", "state" }`,
  finalizePrompt: `Разговорът приключи. Напиши финален текст на жалба от complaintState и историята.

- Без въпроси; без измислени факти; спазвай state.
- title: ясно, с името на марката (6-120 символа).
- body: 3-6 абзаца, първо лице, хронологично, конкретно, подходящо за модерация.
- reply: 1-2 изречения — представяш обобщението и чакаш потвърждение.
- readyToContinue: true
- state: върни актуалния state без промени.

JSON:
{ "reply", "title", "body", "brandName", "rating", "readyToContinue", "draftQuality", "missingFields", "state" }`,
  customInstructions: "",
  temperature: 0.55,
  maxTokens: 1100,
};

const META_KEY = "complaint_assistant_config_v1";

let cache: ComplaintAssistantConfig | null = null;
let cacheAt = 0;
const CACHE_MS = 30_000;

function clampConfig(raw: Partial<ComplaintAssistantConfig>): ComplaintAssistantConfig {
  const d = DEFAULT_COMPLAINT_ASSISTANT_CONFIG;
  return {
    greeting: (raw.greeting ?? d.greeting).trim().slice(0, 500) || d.greeting,
    systemPrompt: (raw.systemPrompt ?? d.systemPrompt).trim().slice(0, 8000) || d.systemPrompt,
    finalizePrompt: (raw.finalizePrompt ?? d.finalizePrompt).trim().slice(0, 8000) || d.finalizePrompt,
    customInstructions: (raw.customInstructions ?? d.customInstructions).trim().slice(0, 4000),
    temperature: Math.min(1, Math.max(0, Number(raw.temperature ?? d.temperature) || d.temperature)),
    maxTokens: Math.min(2000, Math.max(400, Math.round(Number(raw.maxTokens ?? d.maxTokens) || d.maxTokens))),
  };
}

export async function loadComplaintAssistantConfig(): Promise<ComplaintAssistantConfig> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) return cache;

  const url = process.env.DATABASE_URL;
  if (!url) {
    cache = DEFAULT_COMPLAINT_ASSISTANT_CONFIG;
    cacheAt = now;
    return cache;
  }

  const sql = postgres(url, { max: 1 });
  try {
    await sql`CREATE TABLE IF NOT EXISTS app_meta (key text PRIMARY KEY, value text)`.catch(() => {});
    const rows = await sql<{ value: string }[]>`
      SELECT value FROM app_meta WHERE key = ${META_KEY} LIMIT 1
    `;
    if (!rows[0]?.value) {
      cache = DEFAULT_COMPLAINT_ASSISTANT_CONFIG;
    } else {
      try {
        cache = clampConfig(JSON.parse(rows[0].value) as Partial<ComplaintAssistantConfig>);
      } catch {
        cache = DEFAULT_COMPLAINT_ASSISTANT_CONFIG;
      }
    }
    cacheAt = now;
    return cache;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function saveComplaintAssistantConfig(
  input: Partial<ComplaintAssistantConfig>,
): Promise<ComplaintAssistantConfig> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL yok");

  const current = await loadComplaintAssistantConfig();
  const next = clampConfig({ ...current, ...input });

  const sql = postgres(url, { max: 1 });
  try {
    await sql`CREATE TABLE IF NOT EXISTS app_meta (key text PRIMARY KEY, value text)`;
    await sql`
      INSERT INTO app_meta (key, value) VALUES (${META_KEY}, ${JSON.stringify(next)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    cache = next;
    cacheAt = Date.now();
    return next;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export function invalidateComplaintAssistantConfigCache(): void {
  cache = null;
  cacheAt = 0;
}
