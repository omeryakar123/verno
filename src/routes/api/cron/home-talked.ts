import { createFileRoute } from "@tanstack/react-router";
import { currentTalkedBucket, fetchHomeTalkedItems, HOME_TALKED_SLOT_MS } from "@/lib/server/home-talked";
import { syncManualBrandLogosToDb } from "@/lib/server/sync-manual-logos";
import { HttpError, errorResponse, isStaff, optionalUser } from "@/lib/server/guard";

// Anasayfa «Çok Konuşulanlar» + logo senkronu (30 dk'da bir).
// Coolify Scheduled Task (her 30 dk):
//   0,30 * * * * curl -fsS -X POST https://tepkimvar.com/api/cron/home-talked \
//     -H "Authorization: Bearer $CRON_SECRET"

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function authorize(request: Request): Promise<void> {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (secret && token && safeEqual(token, secret)) return;
  const user = await optionalUser(request);
  if (user && (await isStaff(user.id))) return;
  throw new HttpError(401, "Yetkisiz");
}

export const Route = createFileRoute("/api/cron/home-talked")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await authorize(request);
          const bucket = currentTalkedBucket();
          const talked = await fetchHomeTalkedItems({ limit: 4, bucket });
          const logos = await syncManualBrandLogosToDb();

          return Response.json({
            ok: true,
            bucket,
            slotMs: HOME_TALKED_SLOT_MS,
            talked: {
              count: talked.items.length,
              refreshedAt: talked.refreshedAt,
              ids: talked.items.map((i) => i.id),
            },
            logos,
          });
        } catch (e) {
          return errorResponse(e);
        }
      },
      GET: async ({ request }) => {
        try {
          await authorize(request);
          const bucket = currentTalkedBucket();
          const talked = await fetchHomeTalkedItems({ limit: 4, bucket });
          return Response.json({ ok: true, bucket, count: talked.items.length });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
