import type { Company, Complaint } from "@/lib/mock-data";
import type { TrendBrand } from "@/lib/trend-brand";

export function isPlaceholderComplaintId(id: string): boolean {
  return /^ph-\d+$/i.test(id.trim());
}

/**
 * Örnek (placeholder) içerik — gerçek veri yokken gösterilir.
 *
 * ÖNEMLİ: Buradaki markalar kasıtlı olarak UYDURMADIR. Daha önce burada gerçek
 * Bulgar şirketleri (eMAG, ДСК Банк, Yettel, Vivacom …) logoları, uydurma
 * yıldız puanları ve uydurma "resmi marka yanıtları" ile yer alıyordu. Gerçek
 * bir tüzel kişiye ait olmayan şikayet, puan veya beyan yayınlamak AB Haksız
 * Ticari Uygulamalar Direktifi Ek I (BG: ЗЗП) kapsamında yasaktır ve markanın
 * ağzına söz koymak ayrıca sorumluluk doğurur.
 *
 * Buraya ASLA gerçek marka adı, logosu veya web sitesi ekleme.
 */
const BRAND = {
  shopA: {
    slug: "ph-magazin-a",
    name: "Онлайн магазин А (пример)",
    logoUrl: null,
    category: "e-ticaret" as const,
    categoryName: "Електронна търговия",
    website: "",
  },
  bankA: {
    slug: "ph-banka-a",
    name: "Банка А (пример)",
    logoUrl: null,
    category: "finans" as const,
    categoryName: "Банки",
    website: "",
  },
  telecomA: {
    slug: "ph-telekom-a",
    name: "Телеком А (пример)",
    logoUrl: null,
    category: "telekom" as const,
    categoryName: "Телеком",
    website: "",
  },
  courierA: {
    slug: "ph-kurier-a",
    name: "Куриер А (пример)",
    logoUrl: null,
    category: "diger" as const,
    categoryName: "Куриери",
    website: "",
  },
  telecomB: {
    slug: "ph-telekom-b",
    name: "Телеком Б (пример)",
    logoUrl: null,
    category: "telekom" as const,
    categoryName: "Телеком",
    website: "",
  },
  bankB: {
    slug: "ph-banka-b",
    name: "Банка Б (пример)",
    logoUrl: null,
    category: "finans" as const,
    categoryName: "Банки",
    website: "",
  },
  courierB: {
    slug: "ph-kurier-b",
    name: "Куриер Б (пример)",
    logoUrl: null,
    category: "diger" as const,
    categoryName: "Куриери",
    website: "",
  },
  telecomC: {
    slug: "ph-telekom-v",
    name: "Телеком В (пример)",
    logoUrl: null,
    category: "telekom" as const,
    categoryName: "Телеком",
    website: "",
  },
};

/** Örnek marka slug'ı mı — gerçek marka sayfasına link verilmemeli. */
export function isPlaceholderBrandSlug(slug: string): boolean {
  return slug.trim().toLowerCase().startsWith("ph-");
}

function company(
  b: (typeof BRAND)[keyof typeof BRAND],
  extra: Pick<
    Company,
    | "rating"
    | "ratingCount"
    | "totalComplaints"
    | "resolutionRate"
    | "avgResponseMinutes"
  >,
): Company {
  return {
    ...b,
    about: "",
    ...extra,
  };
}

export const PLACEHOLDER_BRANDS: Company[] = [
  company(BRAND.shopA, {
    rating: 4.6,
    ratingCount: 1284,
    totalComplaints: 842,
    resolutionRate: 94,
    avgResponseMinutes: 180,
  }),
  company(BRAND.bankA, {
    rating: 4.4,
    ratingCount: 960,
    totalComplaints: 612,
    resolutionRate: 91,
    avgResponseMinutes: 240,
  }),
  company(BRAND.telecomA, {
    rating: 4.2,
    ratingCount: 740,
    totalComplaints: 530,
    resolutionRate: 88,
    avgResponseMinutes: 210,
  }),
  company(BRAND.courierA, {
    rating: 4.1,
    ratingCount: 510,
    totalComplaints: 388,
    resolutionRate: 86,
    avgResponseMinutes: 150,
  }),
  company(BRAND.telecomB, {
    rating: 4.0,
    ratingCount: 430,
    totalComplaints: 350,
    resolutionRate: 83,
    avgResponseMinutes: 200,
  }),
  company(BRAND.bankB, {
    rating: 4.3,
    ratingCount: 390,
    totalComplaints: 274,
    resolutionRate: 81,
    avgResponseMinutes: 300,
  }),
  company(BRAND.courierB, {
    rating: 4.0,
    ratingCount: 280,
    totalComplaints: 198,
    resolutionRate: 79,
    avgResponseMinutes: 160,
  }),
  company(BRAND.telecomC, {
    rating: 3.9,
    ratingCount: 260,
    totalComplaints: 176,
    resolutionRate: 77,
    avgResponseMinutes: 220,
  }),
];

export const PLACEHOLDER_TREND: TrendBrand[] = PLACEHOLDER_BRANDS.map(
  (b, i) => ({
    ...b,
    recentComplaints: 28 - i * 2,
    priorComplaints: 16 - i,
    recentViews: 4200 - i * 280,
    recentSupports: 90 - i * 7,
    trendScore: 980 - i * 40,
  }),
);

export const PLACEHOLDER_COMPLAINTS: Complaint[] = [
  {
    id: "ph-1",
    publicId: "ph-1",
    title: "Поръчката ми беше доставена след ескалация — сумата възстановена",
    body: "Поръчах телефон от онлайн магазин на 2 септември. Пратката беше маркирана като доставена, но куриер не дойде. След жалба в verno.bg марката се свърза в рамките на 24 часа, изпрати нова доставка и възстанови таксата за преглед. Случаят приключи за три дни.",
    companySlug: BRAND.shopA.slug,
    companyName: BRAND.shopA.name,
    category: BRAND.shopA.category,
    categoryName: BRAND.shopA.categoryName,
    userInitials: "ЕД",
    userName: "Елена Димитрова",
    createdAgo: "преди 2 часа",
    status: "cozuldu",
    views: 2310,
    comments: 38,
    votes: 143,
    supported: false,
    brandId: "",
    companyReply: {
      body: "Извиняваме се за объркването с доставката. Изпратихме нова пратка и възстановихме таксата. Благодарим, че ни дадохте възможност да оправим случая.",
      agoLabel: "преди 1 ден",
    },
  },
  {
    id: "ph-2",
    publicId: "ph-2",
    title: "Таксата беше възстановена по сметката след жалба",
    body: "Банката удържа такса за услуга, която бях отказал месец по-рано. След жалба получих обаждане от екипа и пълно възстановяване в същия работен ден. Документите бяха прегледани без да ходя до клон.",
    companySlug: BRAND.bankA.slug,
    companyName: BRAND.bankA.name,
    category: BRAND.bankA.category,
    categoryName: BRAND.bankA.categoryName,
    userInitials: "ИП",
    userName: "Иван Петров",
    createdAgo: "преди 5 часа",
    status: "cozuldu",
    views: 3120,
    comments: 51,
    votes: 208,
    supported: false,
    brandId: "",
    companyReply: {
      body: "Таксата е сторнирана. Обновихме настройките по сметката, за да не се повтори.",
      agoLabel: "преди 4 часа",
    },
  },
  {
    id: "ph-3",
    publicId: "ph-3",
    title: "Интернет проблемът беше отстранен в рамките на 48 часа",
    body: "Два дни нямах стабилен интернет в ж.к. Младост. След публикуване на жалбата техник дойде на следващия ден, смени кабела до етажната кутия и връзката се възстанови. Получих и компенсация за дните без услуга.",
    companySlug: BRAND.telecomA.slug,
    companyName: BRAND.telecomA.name,
    category: BRAND.telecomA.category,
    categoryName: BRAND.telecomA.categoryName,
    userInitials: "МГ",
    userName: "Мартин Георгиев",
    createdAgo: "преди 1 ден",
    status: "cozuldu",
    views: 1840,
    comments: 24,
    votes: 96,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-4",
    publicId: "ph-4",
    title: "Пратката пристигна след повторна доставка",
    body: "Пратка от Пловдив към София беше върната като „ненамерен получател“, въпреки че бях в офиса. След жалбата куриерът се обади, насрочихме нов час и колетите пристигнаха на следващия ден без допълнителна такса.",
    companySlug: BRAND.courierA.slug,
    companyName: BRAND.courierA.name,
    category: BRAND.courierA.category,
    categoryName: BRAND.courierA.categoryName,
    userInitials: "СА",
    userName: "София Ангелова",
    createdAgo: "преди 2 дни",
    status: "cozuldu",
    views: 940,
    comments: 11,
    votes: 42,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-5",
    publicId: "ph-5",
    title: "Грешна фактура за роуминг — чакам корекция",
    body: "Получих фактура с роуминг такси от пътуване, което отмениха. Прикачих потвърждението от авиокомпанията. Марката потвърди, че случаят е приет и чакам коригирана фактура до края на седмицата.",
    companySlug: BRAND.telecomB.slug,
    companyName: BRAND.telecomB.name,
    category: BRAND.telecomB.category,
    categoryName: BRAND.telecomB.categoryName,
    userInitials: "НК",
    userName: "Николай Костов",
    createdAgo: "преди 3 дни",
    status: "yanitlandi",
    views: 760,
    comments: 9,
    votes: 31,
    supported: false,
    brandId: "",
    companyReply: {
      body: "Проверихме записа. Ще издадем кредитно известие до петък и ще потвърдим по имейл.",
      agoLabel: "преди 1 ден",
    },
  },
  {
    id: "ph-6",
    publicId: "ph-6",
    title: "Карта беше блокирана без предизвестие",
    body: "Картата ми беше спряна в чужбина без SMS или имейл. Останах без плащане за един ден. Искам ясно обяснение и компенсация за таксите от банкомат на друго дружество.",
    companySlug: BRAND.bankB.slug,
    companyName: BRAND.bankB.name,
    category: BRAND.bankB.category,
    categoryName: BRAND.bankB.categoryName,
    userInitials: "ДВ",
    userName: "Десислава Василева",
    createdAgo: "преди 4 дни",
    status: "yeni",
    views: 1280,
    comments: 17,
    votes: 64,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-7",
    publicId: "ph-7",
    title: "Офисът върна пратката като непълна",
    body: "Изпратих връщане към магазин. В офиса отбелязаха пратката като непълна, въпреки че всички артикули бяха вътре. Качих снимки от опаковането. Искам пратката да бъде приета и възстановяването да тръгне.",
    companySlug: BRAND.courierB.slug,
    companyName: BRAND.courierB.name,
    category: BRAND.courierB.category,
    categoryName: BRAND.courierB.categoryName,
    userInitials: "ГТ",
    userName: "Георги Тодоров",
    createdAgo: "преди 6 дни",
    status: "yeni",
    views: 540,
    comments: 6,
    votes: 19,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-8",
    publicId: "ph-8",
    title: "Договор беше подновен автоматично без ясно съгласие",
    body: "Абонаментът ми беше удължен с 12 месеца след промоционален период. В имейлите няма ясен отказ. Искам прекратяване без неустойка и потвърждение в писмен вид.",
    companySlug: BRAND.telecomC.slug,
    companyName: BRAND.telecomC.name,
    category: BRAND.telecomC.category,
    categoryName: BRAND.telecomC.categoryName,
    userInitials: "РН",
    userName: "Рая Николова",
    createdAgo: "преди 1 седмица",
    status: "yanitlandi",
    views: 2104,
    comments: 22,
    votes: 88,
    supported: false,
    brandId: "",
    companyReply: {
      body: "Преглеждаме записа на съгласието. Ще се свържем до два работни дни с конкретно предложение.",
      agoLabel: "преди 2 дни",
    },
  },
];

export function getPlaceholderComplaint(id: string): Complaint | undefined {
  const key = id.trim();
  return PLACEHOLDER_COMPLAINTS.find((c) => c.id === key || c.publicId === key);
}

export function complaintsOrPlaceholders(items: Complaint[]): Complaint[] {
  return items.length > 0 ? items : PLACEHOLDER_COMPLAINTS;
}

export function brandsOrPlaceholders(items: Company[]): Company[] {
  return items.length > 0 ? items : PLACEHOLDER_BRANDS;
}

export function trendOrPlaceholders(items: TrendBrand[]): TrendBrand[] {
  return items.length > 0 ? items : PLACEHOLDER_TREND;
}
