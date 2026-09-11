import { createFileRoute } from "@tanstack/react-router";
import { and, eq, ilike, notInArray, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { toDbComplaint, type BrandNested } from "@/lib/db-shapes";
import { displayPhone } from "@/lib/phone-mask";
import { normalizePlatformUsername } from "@/lib/server/ai/prompts";
import { isBrandMember, isStaff, optionalUser } from "@/lib/server/guard";
import { supportedComplaintIds } from "@/lib/server/complaint-support";
import { loadAuthorProfile } from "@/lib/server/author-profile";
import { loadComplaintAttachments } from "@/lib/server/complaint-evidence";
import { ensureDbPatches } from "@/lib/server/ensure-db-patches";

// Public: tek şikayet. $id uuid, public_id veya short_id olabilir.
const HIDDEN_STATUSES = ["rejected", "spam"] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeComplaintParam(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function buildIdMatch(id: string): SQL {
  if (UUID_RE.test(id)) return eq(schema.complaints.id, id);

  const upper = id.toUpperCase();
  const lower = id.toLowerCase();

  return or(
    eq(schema.complaints.publicId, upper),
    eq(schema.complaints.shortId, lower),
    ilike(schema.complaints.publicId, upper),
  ) as SQL;
}

export const Route = createFileRoute("/api/complaints/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        await ensureDbPatches();

        const id = normalizeComplaintParam(params.id);
        if (!id) return new Response("Not Found", { status: 404 });

        const idMatch = buildIdMatch(id);

        const [row] = await db
          .select({ c: schema.complaints, b: schema.brands })
          .from(schema.complaints)
          .innerJoin(
            schema.brands,
            eq(schema.complaints.brandId, schema.brands.id),
          )
          .where(
            and(
              idMatch,
              notInArray(schema.complaints.status, [...HIDDEN_STATUSES]),
            ),
          )
          .limit(1);

        if (!row) return new Response("Not Found", { status: 404 });

        const viewer = await optionalUser(request);
        const isOwner = !!viewer && row.c.userId === viewer.id;
        const staff = !!viewer && (await isStaff(viewer.id));

        if (row.c.hidden) {
          // Gizli şikayet: yalnızca yazan müşteri veya personel görebilir.
          if (!isOwner && !staff)
            return new Response("Not Found", { status: 404 });
        } else if (row.c.status === "pending") {
          if (!isOwner && !staff) {
            return Response.json(
              {
                error:
                  "Bu şikayet henüz yayında değil veya moderasyon bekliyor.",
                code: "not_public",
              },
              { status: 403 },
            );
          }
        } else {
          const publiclyVisible = row.c.isPublic || row.c.isSynthetic;
          if (!publiclyVisible && !isOwner && !staff) {
            return Response.json(
              {
                error:
                  "Bu şikayet henüz yayında değil veya moderasyon bekliyor.",
                code: "not_public",
              },
              { status: 403 },
            );
          }
        }

        if (!staff) {
          await db
            .update(schema.complaints)
            .set({ views: sql`${schema.complaints.views} + 1` })
            .where(eq(schema.complaints.id, row.c.id));
        }

        const brand: BrandNested = {
          name: row.b.name,
          slug: row.b.slug,
          logo_url: row.b.logoUrl,
          verified: row.b.verified,
        };
        const dc = toDbComplaint(row.c, brand);

        if (dc.is_anonymous) {
          dc.user_id = null;
          dc.profiles = null;
        } else if (dc.user_id) {
          dc.profiles = await loadAuthorProfile(dc.user_id);
        }

        // Ham telefon yalnızca şikayet sahibine, personele ve marka yetkilisine döner;
        // diğer ziyaretçiler sadece maskelenmiş görünümü alır.
        const brandAccess =
          !!viewer && (await isBrandMember(viewer.id, row.c.brandId));
        const phoneMode: "full" | "masked" =
          isOwner || staff || brandAccess ? "full" : "masked";

        const contactFields = dc as typeof dc & {
          platform_username?: string | null;
          contact_phone?: string | null;
          contact_phone_display?: string | null;
        };
        contactFields.platform_username = row.c.platformUsername
          ? normalizePlatformUsername(row.c.platformUsername)
          : null;
        contactFields.contact_phone =
          phoneMode === "full" ? (row.c.contactPhone ?? null) : null;
        contactFields.contact_phone_display = displayPhone(
          row.c.contactPhone,
          phoneMode,
        );

        if (viewer) {
          const supported = await supportedComplaintIds(viewer.id, [dc.id]);
          (dc as typeof dc & { user_supported?: boolean }).user_supported =
            supported.has(dc.id);
        }

        const attachments = await loadComplaintAttachments(row.c.id);
        const canSeeRestricted = isOwner || staff || brandAccess;

        const publicAttachments = attachments
          .filter((a) => {
            if (a.visibility === "public") return true;
            if (canSeeRestricted) return true;
            return false;
          })
          .map((a) => ({
            id: a.id,
            url: `/api/files/${a.storage_path}`,
            file_type: a.file_type,
            sensitive: a.sensitive,
          }));

        return Response.json({
          ...dc,
          attachments: publicAttachments,
        });
      },
    },
  },
});
