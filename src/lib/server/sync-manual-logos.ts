import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { isManualBrandLogoUrl } from "@/lib/brand-logo-manual";
import { MANUAL_BRAND_LOGOS } from "@/lib/manual-brand-logos";

export type SyncManualLogosResult = {
  scanned: number;
  updated: number;
  skippedManual: number;
  skippedOk: number;
  missingAsset: string[];
};

/**
 * public/brand-logos + MANUAL_BRAND_LOGOS eşlemesini DB'ye yazar.
 * Panelden yüklenen (/api/files/brand-logos/{id}/…) logolar asla ezilmez.
 */
export async function syncManualBrandLogosToDb(): Promise<SyncManualLogosResult> {
  const rows = await db
    .select({
      id: schema.brands.id,
      slug: schema.brands.slug,
      logoUrl: schema.brands.logoUrl,
    })
    .from(schema.brands);

  let updated = 0;
  let skippedManual = 0;
  let skippedOk = 0;
  const missingAsset: string[] = [];

  for (const row of rows) {
    const current = row.logoUrl?.trim() ?? "";

    if (isManualBrandLogoUrl(current)) {
      skippedManual++;
      continue;
    }

    const manual = MANUAL_BRAND_LOGOS[row.slug];
    if (!manual) {
      skippedOk++;
      continue;
    }

    if (current === manual) {
      skippedOk++;
      continue;
    }

    await db
      .update(schema.brands)
      .set({ logoUrl: manual, updatedAt: new Date() })
      .where(eq(schema.brands.id, row.id));
    updated++;

    if (manual.startsWith("/brand-logos/")) {
      missingAsset.push(row.slug);
    }
  }

  return {
    scanned: rows.length,
    updated,
    skippedManual,
    skippedOk,
    missingAsset,
  };
}
