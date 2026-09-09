import { createFileRoute } from "@tanstack/react-router";
import { currentTalkedBucket, fetchHomeTalkedItems, HOME_TALKED_SLOT_MS } from "@/lib/server/home-talked";
import { errorResponse } from "@/lib/server/guard";

/** Çok konuşulanlar — 30 dk'da bir farklı doldurma; öncelikli markalar sabit kalır. */
export const Route = createFileRoute("/api/home-talked")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = Number(url.searchParams.get("limit")) || 4;
          const slotParam = url.searchParams.get("slot");
          const bucket =
            slotParam !== null && slotParam !== "" && Number.isFinite(Number(slotParam))
              ? Number(slotParam)
              : currentTalkedBucket();

          const { items, bucket: usedBucket, refreshedAt } = await fetchHomeTalkedItems({
            limit,
            bucket,
          });

          return Response.json(
            { items, bucket: usedBucket, refreshedAt },
            {
              headers: {
                "Cache-Control": `public, max-age=${Math.floor(HOME_TALKED_SLOT_MS / 1000)}, stale-while-revalidate=60`,
              },
            },
          );
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
