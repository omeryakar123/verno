import type { Company, Complaint } from "@/lib/mock-data";
import type { TrendBrand } from "@/lib/trend-brand";

export function isPlaceholderComplaintId(id: string): boolean {
  return /^ph-\d+$/i.test(id.trim());
}

const BRAND = {
  emag: { slug: "emag", name: "eMAG", logoUrl: "/brand-logos/emag.png", category: "e-ticaret" as const, categoryName: "Електронна търговия", website: "https://emag.bg" },
  dsk: { slug: "dsk-bank", name: "ДСК Банк", logoUrl: "/brand-logos/dsk-bank.png", category: "finans" as const, categoryName: "Банки", website: "https://dskbank.bg" },
  telenor: { slug: "telenor", name: "Yettel", logoUrl: "/brand-logos/telenor.png", category: "telekom" as const, categoryName: "Телеком", website: "https://yettel.bg" },
  speedy: { slug: "speedy", name: "Спиди", logoUrl: "/brand-logos/speedy.png", category: "diger" as const, categoryName: "Куриери", website: "https://speedy.bg" },
  a1: { slug: "a1", name: "A1", logoUrl: "/brand-logos/a1.png", category: "telekom" as const, categoryName: "Телеком", website: "https://a1.bg" },
  unicredit: { slug: "unicredit", name: "УниКредит", logoUrl: "/brand-logos/unicredit.png", category: "finans" as const, categoryName: "Банки", website: "https://unicreditbulbank.bg" },
  econt: { slug: "econt", name: "Еконт", logoUrl: "/brand-logos/econt.png", category: "diger" as const, categoryName: "Куриери", website: "https://econt.com" },
  vivacom: { slug: "vivacom", name: "Vivacom", logoUrl: "/brand-logos/vivacom.png", category: "telekom" as const, categoryName: "Телеком", website: "https://vivacom.bg" },
};

function company(
  b: (typeof BRAND)[keyof typeof BRAND],
  extra: Pick<Company, "rating" | "ratingCount" | "totalComplaints" | "resolutionRate" | "avgResponseMinutes">,
): Company {
  return {
    ...b,
    about: "",
    ...extra,
  };
}

export const PLACEHOLDER_BRANDS: Company[] = [
  company(BRAND.emag, { rating: 4.6, ratingCount: 1284, totalComplaints: 842, resolutionRate: 94, avgResponseMinutes: 180 }),
  company(BRAND.dsk, { rating: 4.4, ratingCount: 960, totalComplaints: 612, resolutionRate: 91, avgResponseMinutes: 240 }),
  company(BRAND.telenor, { rating: 4.2, ratingCount: 740, totalComplaints: 530, resolutionRate: 88, avgResponseMinutes: 210 }),
  company(BRAND.speedy, { rating: 4.1, ratingCount: 510, totalComplaints: 388, resolutionRate: 86, avgResponseMinutes: 150 }),
  company(BRAND.a1, { rating: 4.0, ratingCount: 430, totalComplaints: 350, resolutionRate: 83, avgResponseMinutes: 200 }),
  company(BRAND.unicredit, { rating: 4.3, ratingCount: 390, totalComplaints: 274, resolutionRate: 81, avgResponseMinutes: 300 }),
  company(BRAND.econt, { rating: 4.0, ratingCount: 280, totalComplaints: 198, resolutionRate: 79, avgResponseMinutes: 160 }),
  company(BRAND.vivacom, { rating: 3.9, ratingCount: 260, totalComplaints: 176, resolutionRate: 77, avgResponseMinutes: 220 }),
];

export const PLACEHOLDER_TREND: TrendBrand[] = PLACEHOLDER_BRANDS.map((b, i) => ({
  ...b,
  recentComplaints: 28 - i * 2,
  priorComplaints: 16 - i,
  recentViews: 4200 - i * 280,
  recentSupports: 90 - i * 7,
  trendScore: 980 - i * 40,
}));

export const PLACEHOLDER_COMPLAINTS: Complaint[] = [
  {
    id: "ph-1",
    publicId: "ph-1",
    title: "Поръчката ми беше доставена след ескалация — сумата възстановена",
    body: "Поръчах телефон през eMAG на 2 септември. Пратката беше маркирана като доставена, но куриер не дойде. След жалба в verno.bg марката се свърза в рамките на 24 часа, изпрати нова доставка и възстанови таксата за преглед. Случаят приключи за три дни.",
    companySlug: BRAND.emag.slug,
    companyName: BRAND.emag.name,
    category: BRAND.emag.category,
    categoryName: BRAND.emag.categoryName,
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
    companySlug: BRAND.dsk.slug,
    companyName: BRAND.dsk.name,
    category: BRAND.dsk.category,
    categoryName: BRAND.dsk.categoryName,
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
    companySlug: BRAND.telenor.slug,
    companyName: BRAND.telenor.name,
    category: BRAND.telenor.category,
    categoryName: BRAND.telenor.categoryName,
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
    companySlug: BRAND.speedy.slug,
    companyName: BRAND.speedy.name,
    category: BRAND.speedy.category,
    categoryName: BRAND.speedy.categoryName,
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
    companySlug: BRAND.a1.slug,
    companyName: BRAND.a1.name,
    category: BRAND.a1.category,
    categoryName: BRAND.a1.categoryName,
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
    companySlug: BRAND.unicredit.slug,
    companyName: BRAND.unicredit.name,
    category: BRAND.unicredit.category,
    categoryName: BRAND.unicredit.categoryName,
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
    companySlug: BRAND.econt.slug,
    companyName: BRAND.econt.name,
    category: BRAND.econt.category,
    categoryName: BRAND.econt.categoryName,
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
    companySlug: BRAND.vivacom.slug,
    companyName: BRAND.vivacom.name,
    category: BRAND.vivacom.category,
    categoryName: BRAND.vivacom.categoryName,
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
