import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const ACTIVE_STATES = ["open", "reviewing"] as const;

/**
 * Bekleyen şikayetler ↔ moderasyon kuyruğu tutarlılığı.
 * - pending şikayet → açık kuyruk kaydı yoksa oluştur
 * - artık pending olmayan şikayet → açık kuyruk kaydını kapat
 */
export async function syncPendingComplaintsToModerationQueue(): Promise<{
  created: number;
  closed: number;
}> {
  let created = 0;

  const pendingRows = await db
    .select({
      id: schema.complaints.id,
      title: schema.complaints.title,
    })
    .from(schema.complaints)
    .where(eq(schema.complaints.status, "pending"));

  for (const c of pendingRows) {
    const [existing] = await db
      .select({ id: schema.moderationQueue.id })
      .from(schema.moderationQueue)
      .where(
        and(
          eq(schema.moderationQueue.targetType, "complaint"),
          eq(schema.moderationQueue.targetId, c.id),
          inArray(schema.moderationQueue.state, [...ACTIVE_STATES]),
        ),
      )
      .limit(1);

    if (existing) continue;

    await db.insert(schema.moderationQueue).values({
      kind: "other",
      state: "open",
      priority: 1,
      summary: `Yeni şikayet: ${c.title.slice(0, 80)}`,
      payload: {},
      targetType: "complaint",
      targetId: c.id,
      relatedTable: "complaints",
      relatedId: c.id,
    });
    created++;
  }

  const closedRows = await db
    .update(schema.moderationQueue)
    .set({
      state: "resolved",
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      sql`${schema.moderationQueue.id} IN (
        SELECT mq.id
        FROM moderation_queue mq
        INNER JOIN complaints c ON c.id = mq.target_id
        WHERE mq.target_type = 'complaint'
          AND mq.state IN ('open', 'reviewing')
          AND c.status <> 'pending'
      )`,
    )
    .returning({ id: schema.moderationQueue.id });

  return { created, closed: closedRows.length };
}

/** Admin bildirimi ve moderasyon sayfası ile aynı sayaç mantığı. */
export async function getModerationStats(): Promise<{ pending: number; open: number }> {
  await syncPendingComplaintsToModerationQueue();

  const [{ complaintPending }] = await db
    .select({ complaintPending: sql<number>`count(*)::int` })
    .from(schema.moderationQueue)
    .where(
      and(
        inArray(schema.moderationQueue.state, [...ACTIVE_STATES]),
        eq(schema.moderationQueue.targetType, "complaint"),
      ),
    );

  const [{ open }] = await db
    .select({ open: sql<number>`count(*)::int` })
    .from(schema.moderationQueue)
    .where(inArray(schema.moderationQueue.state, [...ACTIVE_STATES]));

  return {
    pending: Number(complaintPending ?? 0),
    open: Number(open ?? 0),
  };
}
