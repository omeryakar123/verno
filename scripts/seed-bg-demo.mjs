/**
 * Bulgarca DEMO verisi — verno.bg için markalar + logolar + şikayetler + puanlar.
 *
 *   node scripts/seed-bg-demo.mjs
 *
 * - Kategoriler: mobil/web'in beklediği slug'lar (telekom, eticaret, banka, …)
 * - Markalar: logo_url = /brand-logos/<slug>.png (statik dosya, hem web hem mobil)
 * - Şikayetler: Bulgarca; YILDIZ yalnızca sonuçlanan (resolved/answered) kayıtlarda —
 *   memnun = 5, memnun değil = 1, orta = 3-4. Marka puanı bu notların ortalamasından
 *   hesaplanır (100'lük gösterim: ortalama / 5 × 100).
 * - Sonda tüm marka sayaçları gerçek satırlardan yeniden hesaplanır.
 *
 * İdempotent: mevcut markayı ve şikayeti olan markayı atlar.
 */
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL gerekli");
  process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL, { max: 3 });

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (d) => new Date(Date.now() - d * 86400_000);
const pubId = () => "VN-" + Math.random().toString(36).slice(2, 8).toUpperCase();

const CATEGORIES = [
  ["Телекомуникации", "telekom", "Phone", 1],
  ["Онлайн магазини", "eticaret", "ShoppingCart", 2],
  ["Банки и финанси", "banka", "Landmark", 3],
  ["Куриери", "kargo", "Truck", 4],
  ["Техника", "teknoloji", "Tv", 5],
  ["Пътувания", "seyahat", "Plane", 6],
  ["Супермаркети", "market", "Store", 7],
];

// slug, name, category, city, domain, verified, premium, hedef ortalama (1-5), çözüm %
const BRANDS = [
  ["telenor", "Теленор", "telekom", "София", "yettel.bg", true, true, 3.4, 74],
  ["a1", "A1 България", "telekom", "София", "a1.bg", true, true, 3.3, 71],
  ["vivacom", "Vivacom", "telekom", "София", "vivacom.bg", true, false, 3.4, 72],
  ["emag", "eMAG", "eticaret", "София", "emag.bg", true, true, 3.9, 84],
  ["booking", "Booking.com", "seyahat", "София", "booking.com", true, false, 3.6, 76],
  ["dsk-bank", "ДСК Банк", "banka", "София", "dskbank.bg", true, false, 3.6, 79],
  ["unicredit", "УниКредит Булбанк", "banka", "София", "unicreditbulbank.bg", true, false, 3.7, 80],
  ["technopolis", "Технополис", "teknoloji", "София", "technopolis.bg", false, false, 3.2, 68],
  ["speedy", "Спиди", "kargo", "София", "speedy.bg", true, false, 3.5, 77],
  ["econt", "Еконт", "kargo", "Русе", "econt.com", true, false, 3.8, 82],
  ["wizz-air", "Wizz Air", "seyahat", "София", "wizzair.com", true, false, 2.8, 55],
  ["lidl", "Лидл България", "market", "София", "lidl.bg", true, false, 4.1, 87],
];

const ABOUT = {
  telenor: "Водещ телеком оператор в България — мобилни и фиксирани услуги, интернет и телевизия.",
  a1: "Мобилен оператор с широка мрежа и планове за частни и бизнес клиенти.",
  vivacom: "Телеком доставчик — интернет, телевизия, мобилни и бизнес решения.",
  emag: "Най-големият онлайн търговец в региона — електроника, домашни стоки и ежедневни покупки.",
  booking: "Глобална платформа за резервации на хотели и настаняване.",
  "dsk-bank": "Една от най-големите банки в страната — кредити, сметки и дигитално банкиране.",
  unicredit: "Международна банкова група с клонове и дигитални услуги в България.",
  technopolis: "Верига магазини за електроника и битова техника с магазини в цялата страна.",
  speedy: "Национален куриер — експресни и стандартни пратки в България и чужбина.",
  econt: "Куриерска компания с офиси в цялата страна и проследяване на пратки.",
  "wizz-air": "Европейска нискотарифна авиокомпания с полети от и до България.",
  lidl: "Международна верига супермаркети с фокус върху качество на достъпни цени.",
};

const COMPLAINTS = [
  ["Поръчката ми не беше доставена в срок", "Поръчах преди повече от седмица, а статусът не се променя. Обажданията до центъра за обслужване остават без резултат."],
  ["Възстановяването на сумата се бави", "Върнах продукта според условията, но парите не са постъпили по сметката ми вече две седмици."],
  ["Изпратен е грешен продукт", "Вместо поръчания артикул получих съвсем различен. Заявката ми за замяна стои без отговор."],
  ["Не мога да се свържа с обслужване на клиенти", "От дни се опитвам да се свържа — линията е постоянно заета или връзката прекъсва."],
  ["Такса в сметката, за която не съм уведомен", "В месечната ми сметка фигурира услуга, която никога не съм заявявал. Искам корекция и обяснение."],
  ["Доставката се отлага многократно", "Три пъти получавам нов срок за доставка и нито веднъж не е спазен."],
  ["Продуктът пристигна повреден", "При отваряне на пратката установих, че продуктът е счупен, а опаковката — смачкана."],
  ["Обещаната промоция не беше приложена", "Отстъпката от кампанията не беше начислена при плащане, а поддръжката прехвърля отговорността."],
  ["Акаунтът ми беше ограничен без причина", "Без никакво нарушение достъпът ми беше внезапно ограничен и никой не обяснява защо."],
  ["Липсващи артикули в поръчката", "Два продукта от поръчката ми липсваха, а процедурата по компенсация се точи бавно."],
  ["Техникът не дойде на уговорения час", "Взех отпуск, за да чакам техник, който така и не се появи. Никой не се обади да предупреди."],
  ["Не мога да прекратя абонамента си", "Опитвам да прекратя абонамента онлайн, но системата дава грешка, а на телефона ме прехвърлят между отдели."],
  ["Интернетът прекъсва всяка вечер", "Скоростта пада драстично всяка вечер след 19 часа. Подадох два сигнала — без резултат."],
  ["Отказана рекламация въпреки гаранцията", "Продуктът е в гаранция, но сервизът отказва ремонт с формални аргументи."],
];

const RESPONSES = [
  "Здравейте, извиняваме се за неудобството. Случаят е предаден към отговорния екип и ще получите отговор възможно най-скоро.",
  "Благодарим за сигнала. Стартирахме проверка и ще се свържем с Вас с конкретно решение.",
  "Проверихме случая — проблемът е отстранен и сме предприели мерки да не се повтаря. Извиняваме се за причиненото неудобство.",
  "Заявката Ви е обработена. Сумата/корекцията е отразена и ще я видите в следващото извлечение.",
];

const NAMES = [
  ["Мартин Георгиев", "marting"], ["Елена Димитрова", "elenad"], ["Иван Петров", "ivanp"],
  ["София Ангелова", "sofiaa"], ["Николай Стоянов", "nikolays"], ["Мария Иванова", "mariai"],
  ["Георги Тодоров", "georgit"], ["Виктория Колева", "viktoriak"],
];

const CITIES = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора"];

/** Hedef ortalamaya (1-5) yaklaşan rastgele not — memnun 5, değil 1, orta 3-4. */
function ratingFor(target) {
  const roll = Math.random();
  if (target >= 4) return roll < 0.6 ? 5 : roll < 0.85 ? 4 : pick([1, 2, 3]);
  if (target >= 3.5) return roll < 0.4 ? 5 : roll < 0.7 ? 4 : roll < 0.85 ? 3 : pick([1, 2]);
  if (target >= 3) return roll < 0.25 ? 5 : roll < 0.5 ? 4 : roll < 0.7 ? 3 : pick([1, 2]);
  return roll < 0.15 ? 5 : roll < 0.3 ? 4 : roll < 0.5 ? 3 : pick([1, 1, 2]);
}

async function main() {
  // 1) Kategoriler
  for (const [name, slug, icon, sort] of CATEGORIES) {
    const [exists] = await sql`SELECT 1 FROM categories WHERE slug=${slug} LIMIT 1`;
    if (!exists) {
      await sql`INSERT INTO categories (name, slug, icon, sort_order, is_active)
                VALUES (${name}, ${slug}, ${icon}, ${sort}, true)`;
    }
  }
  const catRows = await sql`SELECT id, slug FROM categories`;
  const catId = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // 2) Demo kullanıcılar
  const userIds = [];
  for (const [full, uname] of NAMES) {
    const email = `${uname}@demo.verno.bg`;
    let [u] = await sql`SELECT id FROM "user" WHERE email=${email}`;
    if (!u) {
      [u] = await sql`INSERT INTO "user" (name, email, email_verified) VALUES (${full}, ${email}, true) RETURNING id`;
      await sql`INSERT INTO profiles (id, full_name, username, email_verified)
                VALUES (${u.id}, ${full}, ${uname}, true) ON CONFLICT (id) DO NOTHING`;
    }
    userIds.push(u.id);
  }

  // 3) Markalar + şikayetler
  let newBrands = 0, newComplaints = 0;
  for (const [slug, name, cat, city, domain, verified, premium, target, resolvedPct] of BRANDS) {
    const logo = `/brand-logos/${slug}.png`;

    let [b] = await sql`SELECT id FROM brands WHERE slug=${slug}`;
    if (!b) {
      [b] = await sql`INSERT INTO brands
        (slug, name, category_id, about, website, city, logo_url, verified, premium, is_active)
        VALUES (${slug}, ${name}, ${catId[cat] ?? null}, ${ABOUT[slug] ?? null},
                ${"https://" + domain}, ${city}, ${logo}, ${verified}, ${premium}, true)
        RETURNING id`;
      newBrands++;
    } else {
      // Logo eksikse tamamla — "logoları DB'ye kaydet" garantisi.
      await sql`UPDATE brands SET logo_url=${logo}, updated_at=now()
                WHERE id=${b.id} AND (logo_url IS NULL OR logo_url = '')`;
    }

    const [{ n }] = await sql`SELECT count(*)::int n FROM complaints WHERE brand_id=${b.id}`;
    if (n > 0) continue;

    const howMany = rnd(26, 42);
    for (let i = 0; i < howMany; i++) {
      const t = pick(COMPLAINTS);
      // Çoğunluk sonuçlanmış olsun ki puan tabanı oluşsun.
      const roll = Math.random();
      const status = roll < resolvedPct / 100 ? "resolved"
        : roll < 0.85 ? "answered"
        : pick(["approved", "in_review"]);
      const created = daysAgo(rnd(1, 90));
      const anon = Math.random() < 0.2;
      const uid = pick(userIds);
      const hasResp = status === "answered" || status === "resolved";
      // YILDIZ KURALI: yalnızca sonuçlanan şikayet puanlanır.
      const ratingVal = hasResp && Math.random() < 0.8 ? ratingFor(target) : null;

      await sql`INSERT INTO complaints
        (user_id, brand_id, category_id, title, body, status, city, rating, views, votes,
         is_anonymous, anon_name, public_id, brand_response, brand_response_at, brand_response_by,
         first_response_minutes, created_at, updated_at)
        VALUES (${uid}, ${b.id}, ${catId[cat] ?? null}, ${t[0]}, ${t[1]}, ${status},
                ${pick(CITIES)}, ${ratingVal}, ${rnd(40, 3200)}, ${rnd(0, 220)},
                ${anon}, ${anon ? "Анонимен потребител" : null}, ${pubId()},
                ${hasResp ? pick(RESPONSES) : null},
                ${hasResp ? daysAgo(rnd(0, 5)) : null}, ${hasResp ? pick(userIds) : null},
                ${hasResp ? rnd(45, 2600) : null}, ${created}, ${created})`;
      newComplaints++;
    }
  }

  // 4) Marka sayaçlarını gerçek satırlardan yeniden hesapla (brand-stats ile aynı mantık)
  await sql`
    UPDATE brands b SET
      total_complaints = coalesce(x.total_count, 0),
      complaints_resolved = coalesce(x.resolved_count, 0),
      complaints_pending = coalesce(x.open_count, 0),
      resolution_rate = CASE WHEN coalesce(x.total_count, 0) > 0
        THEN round(coalesce(x.resolved_count, 0)::numeric * 100 / x.total_count)::int ELSE 0 END,
      avg_response_minutes = coalesce(x.avg_response, 0),
      avg_first_response_minutes = x.avg_response,
      rating = coalesce(x.avg_value, 0),
      rating_count = coalesce(x.vote_count, 0),
      updated_at = now()
    FROM (
      SELECT br.id AS brand_id,
        count(c.id) FILTER (WHERE c.status NOT IN ('rejected','spam'))::int AS total_count,
        count(c.id) FILTER (WHERE c.status IN ('resolved','answered'))::int AS resolved_count,
        count(c.id) FILTER (WHERE c.status IN ('pending','approved','in_review','user_replied','super_admin_review','escalated'))::int AS open_count,
        round(avg(c.first_response_minutes))::int AS avg_response,
        round(avg(c.rating) FILTER (WHERE c.rating IS NOT NULL AND c.status NOT IN ('rejected','spam')), 2) AS avg_value,
        count(c.id) FILTER (WHERE c.rating IS NOT NULL AND c.status NOT IN ('rejected','spam'))::int AS vote_count
      FROM brands br LEFT JOIN complaints c ON c.brand_id = br.id
      GROUP BY br.id
    ) x
    WHERE b.id = x.brand_id`;

  const [{ bc }] = await sql`SELECT count(*)::int bc FROM brands`;
  const [{ cc }] = await sql`SELECT count(*)::int cc FROM complaints`;
  const sample = await sql`
    SELECT slug, logo_url, rating, rating_count, total_complaints, resolution_rate
    FROM brands ORDER BY total_complaints DESC LIMIT 12`;
  console.log(`Eklendi: ${newBrands} marka, ${newComplaints} şikayet. Toplam: ${bc} marka, ${cc} şikayet.`);
  for (const r of sample) {
    const score = r.rating_count > 0 ? Math.round(Number(r.rating) * 20) : null;
    console.log(`  ${r.slug.padEnd(12)} logo=${r.logo_url} puan=${score ?? "—"}/100 (${r.rating_count} oy) şikayet=${r.total_complaints} çözüm=%${r.resolution_rate}`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
