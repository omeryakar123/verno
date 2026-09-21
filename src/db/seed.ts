/**
 * Kategori seed'i — idempotent ve YIKICI DEĞİL.
 *
 * Çalıştır:
 *   SEED_CONFIRM=yes bun run src/db/seed.ts
 *
 * Eski sürüm burada `complaints`, `brands` ve `categories` tablolarını SİLİP
 * yerine Türkçe demo veri (Trendyol, Turkcell + uydurma şikayetler ve marka
 * yanıtları) yazıyordu. İki ayrı sorun vardı:
 *
 *   1. `.env` çoğu makinede uzak veritabanını gösteriyor — yanlışlıkla
 *      çalıştırmak canlı veriyi siliyordu.
 *   2. Gerçek şirketlere atfedilmiş uydurma şikayet ve "resmi marka yanıtı"
 *      yayınlamak AB Haksız Ticari Uygulamalar Direktifi Ek I (BG: ЗЗП)
 *      kapsamında yasaktır.
 *
 * Bu yüzden seed artık yalnızca eksik kategorileri ekler. Marka ve şikayet
 * verisi ürünün kendisinden gelir; uydurulmaz.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "./index";

/**
 * Slug'lar Türkçe kalır — mevcut `/kategori/$slug` linkleri ve SEO kırılmasın.
 * Görünen adlar Bulgarcadır.
 */
const CATEGORIES = [
  {
    name: "Пазаруване / Електронна търговия",
    slug: "alisveris-e-ticaret",
    icon: "ShoppingCart",
    sortOrder: 1,
  },
  {
    name: "Магазини / Супермаркети",
    slug: "market-supermarket",
    icon: "Store",
    sortOrder: 2,
  },
  {
    name: "Телекомуникации",
    slug: "telekomunikasyon",
    icon: "Phone",
    sortOrder: 3,
  },
  {
    name: "Банки / Финанси",
    slug: "bankacilik-finans",
    icon: "Landmark",
    sortOrder: 4,
  },
  { name: "Транспорт", slug: "ulasim", icon: "Plane", sortOrder: 5 },
  {
    name: "Куриери / Логистика",
    slug: "kargo-lojistik",
    icon: "Truck",
    sortOrder: 6,
  },
  {
    name: "Ресторанти / Храна",
    slug: "restoran-yeme-icme",
    icon: "Utensils",
    sortOrder: 7,
  },
  { name: "Енергия", slug: "enerji", icon: "Zap", sortOrder: 8 },
  {
    name: "Електроуреди / Електроника",
    slug: "beyaz-esya-elektronik",
    icon: "Tv",
    sortOrder: 9,
  },
  {
    name: "Облекло / Мода",
    slug: "giyim-moda-tekstil",
    icon: "Shirt",
    sortOrder: 10,
  },
  {
    name: "ИТ / Технологии",
    slug: "bilisim-teknoloji",
    icon: "Cpu",
    sortOrder: 11,
  },
];

async function main() {
  if (process.env.SEED_CONFIRM !== "yes") {
    console.error(
      "Seed çalıştırılmadı. Hedef veritabanını doğrula, sonra:\n" +
        "  SEED_CONFIRM=yes bun run src/db/seed.ts\n" +
        `Hedef: ${process.env.DATABASE_URL?.replace(/\/\/[^@]*@/, "//***@") ?? "DATABASE_URL tanımsız"}`,
    );
    process.exit(1);
  }

  let added = 0;
  for (const cat of CATEGORIES) {
    const [exists] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, cat.slug))
      .limit(1);
    if (exists) continue;
    await db.insert(schema.categories).values(cat);
    added++;
  }

  console.log(
    `Kategori seed tamam — ${added} eklendi, ${CATEGORIES.length - added} zaten vardı.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
