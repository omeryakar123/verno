import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { USER_REQUESTED_BRANDS_MISSING } from "@/data/user-requested-brands-missing";
import { USER_BATCH_46_BRANDS } from "@/data/user-batch-46-brands";
import { MANUAL_BRAND_LOGOS } from "@/lib/manual-brand-logos";
import { slugifyBrandName } from "@/lib/brand-slug";

/** Marka slug → gerçek domain (website + unavatar logo). */
const DOMAIN_OVERRIDES: Record<string, string> = {
  "6q-bet": "6qbet.com",
  "bc-game": "bc.game",
  "casino-metropol": "casinometropol.com",
  "cassino-bet-br": "cassino.bet.br",
  "discount-casino": "discountcasino.com",
  discountcasino: "discountcasino.com",
  "ice-casino": "icecasino.com",
  "im-jbet": "imjbet.com",
  "istinye-casino": "istinyecasino.com",
  "nv-casino": "nvcasino.com",
  "william-hill": "williamhill.com",
  aztekbet: "aztekbet.com",
  bahiscom: "bahiscom.com",
  bahisfair: "bahisfair.com",
  bankobet: "bankobet.com",
  betano: "betano.com",
  betchip: "betchip.com",
  betelli: "betelli.com",
  betewin: "betewin.com",
  betfred: "betfred.com",
  betkom: "betkom.com",
  betlesene: "betlesene.com",
  betroad: "betroad.com",
  betsen: "betsen.com",
  betsin: "betsin.com",
  betsmith: "betsmith.com",
  betsolid: "betsolid.com",
  betvictor: "betvictor.com",
  betwinner: "betwinner.com",
  bycasino: "bycasino.com",
  casher: "casher.com",
  casinomaxi: "casinomaxi.com",
  casinometropol: "casinometropol.com",
  casinosezar: "casinosezar.com",
  casinovale: "casinovale.com",
  casinowon: "casinowon.com",
  cryptobet: "cryptobet.com",
  davegas: "davegas.com",
  dedebet: "dedebet.com",
  dodobet: "dodobet.com",
  elitbahis: "elitbahis.com",
  elitwin: "elitwin.com",
  esascasino: "esascasino.com",
  fanatikbet: "fanatikbet.com",
  galyabet: "galyabet.com",
  gamdom: "gamdom.com",
  ggbet: "gg.bet",
  genzobet: "genzobet.com",
  gizabet: "gizabet.com",
  gobahis: "gobahis.com",
  grandpashabet: "grandpashabet.com",
  handikap: "handikap.com",
  havanabet: "havanabet.com",
  hepyek: "hepyek.com",
  herkulbet: "herkulbet.com",
  hiltonbet: "hiltonbet.com",
  hitpot: "hitpot.com",
  hovarda: "hovarda.com",
  istanbulcasino: "istanbulcasino.com",
  betkare: "betkare.com",
  "nesine-casino": "nesine.com",
  "rekabet-operations": "rekabet.com",
  rekabet: "rekabet.com",
  kralbet: "kralbet.com",
  "bigbro-casino": "bigbrocasino.com",
  matadorbet: "matadorbet.com",
  yorkbet: "yorkbet.com",
  betsat: "betsat.com",
  sunbahis: "sunbahis.com",
  turboslot: "turboslot.com",
  norabahis: "norabahis.com",
  trbetgit: "trbetgit.com",
  "netx-casino": "netxcasino.com",
  milbet: "milbet.com",
  betorder: "betorder.com",
  globalbahis: "globalbahis.com",
  hititbet: "hititbet.com",
  royalbet360: "royalbet360.com",
  bahislion: "bahislion.com",
  bahisnow: "bahisnow.com",
  casinoslot: "casinoslot.com",
  betvakti: "betvakti.com",
  rossibet: "rossibet.com",
  betoffice: "betoffice.com",
  galabet: "galabet.com",
  maksibet: "maksibet.com",
  betpark: "betpark.com",
  kolaybet: "kolaybet.com",
  olabahis: "olabahis.com",
  tipobet365: "tipobet365.com",
  adaxbet: "adaxbet.com",
  neyine: "neyine.com",
  ilbet: "ilbet.com",
  betgaranti: "betgaranti.com",
  milanobet: "milanobet.com",
  underoverbet: "underoverbet.com",
  betandyou: "betandyou.com",
  "galaxy-betting": "galaxybetting.com",
  polo: "polobet.com",
  madridbet: "madridbet.com",
  mrking: "mrking.com",
  sparkent: "sparkent.com",
  jestbahis: "jestbahis.com",
  jetbet: "jetbet.com",
  jokera: "jokera.com",
  kraliyetbet: "kraliyetbet.com",
  lidyabet: "lidyabet.com",
  ligobet: "ligobet.com",
  lordpalace: "lordpalacecasino.com",
  "lord-palace-casino": "lordpalacecasino.com",
  luluslot: "luluslot.com",
  meritking: "mrking.com",
  metrobahis: "metrobahis.com",
  milyar: "milyar.com",
  milyonluk: "milyonluk.com",
  mislikazan: "mislikazan.com",
  monobahis: "monobahis.com",
  napoleon: "napoleongames.be",
  palazzobet: "palazzobet.com",
  parsbet: "parsbet.com",
  plump: "plump.com",
  primebahis: "primebahis.com",
  prizmabet: "prizmabet.com",
  privebet: "privebet.com",
  robinbet: "robinbet.com",
  "sans-casino": "sanscasino.com",
  sanscasino: "sanscasino.com",
  safirbet: "safirbet.com",
  slotbon: "slotbon.com",
  soccer: "soccer.com",
  spino: "spino.com",
  stake: "stake.com",
  supertotobet: "supertotobet.com",
  talksport: "talksport.com",
  teslabahis: "teslabahis.com",
  tekelbet: "tekelbet.net",
  thebet: "thebet.com",
  tipobet: "tipobet.com",
  showbet: "showbet.com",
  f1casino: "f1casino.com",
  yekbet: "yekbet.com",
  b1bahis: "b1bahis.com",
  qcasino: "qcasino.com",
  vegasslot: "vegasslot.com",
  venombet: "venombet.com",
  venusbet: "venusbet.com",
  winnit: "winnit.com",
  yikimisi: "yikimisi.com",
  zbahis: "zbahis.com",
};

const NAME_OVERRIDES: Record<string, string> = {
  "im-jbet": "IM JBET",
  "bc-game": "BC.GAME",
  "cassino-bet-br": "CASSINO.BET.BR",
  ggbet: "GGBET",
  "nv-casino": "NV CASINO",
  "ice-casino": "ICE Casino",
  "6q-bet": "6Q Bet",
  "istinye-casino": "İstinye Casino",
  "discount-casino": "Discount Casino",
  discountcasino: "Discount Casino",
  "casino-metropol": "Casino Metropol",
  casinometropol: "Casino Metropol",
  "sans-casino": "Şans Casino",
  sanscasino: "Şans Casino",
  lordpalace: "Lord Palace",
  "lord-palace-casino": "Lord Palace Casino",
  "nesine-casino": "Nesine Casino",
  "rekabet-operations": "Rekabet Operations",
  "bigbro-casino": "Bigbro Casino",
  "netx-casino": "Netx Casino",
  "galaxy-betting": "Galaxy Betting",
  underoverbet: "UnderOverBet",
  mrking: "MrKing",
  turboslot: "TurboSlot",
  ilbet: "İlbet",
  casinoslot: "CasinoSlot",
  sparkent: "Sparkent",
  f1casino: "F1 Casino",
  qcasino: "Q Casino",
  yekbet: "YEKBET",
  b1bahis: "B1Bahis",
  talksport: "talkSPORT",
  stake: "Stake",
  gamdom: "Gamdom",
};

function rnd(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function displayName(raw: string, slug: string) {
  return NAME_OVERRIDES[slug] ?? raw.trim();
}

function logoUrl(name: string, slug: string) {
  const manual = MANUAL_BRAND_LOGOS[slug];
  if (manual) return manual;
  const dom = DOMAIN_OVERRIDES[slug] ?? `${slug.replace(/-/g, "")}.com`;
  const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=1B263B&color=fff&bold=true&length=2`;
  return `https://unavatar.io/${dom}?fallback=${encodeURIComponent(fb)}`;
}

export type SeedUserRequestedBrandsResult = {
  listSize: number;
  added: number;
  skipped: number;
  addedNames: string[];
  skippedSlugs: string[];
};

/** DB'de slug varsa atlar; yoksa ekler. Script spawn gerektirmez. */
export async function seedUserRequestedBrands(): Promise<SeedUserRequestedBrandsResult> {
  const [cat] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.slug, "bilisim-teknoloji"))
    .limit(1);

  if (!cat) {
    throw new Error("Kategori bulunamadı: bilisim-teknoloji");
  }

  const names: string[] = [];
  const seen = new Set<string>();
  const allRaw = [...USER_REQUESTED_BRANDS_MISSING, ...USER_BATCH_46_BRANDS];
  for (const raw of allRaw) {
    const slug = slugifyBrandName(raw);
    if (seen.has(slug)) continue;
    seen.add(slug);
    names.push(displayName(raw, slug));
  }

  let added = 0;
  let skipped = 0;
  const addedNames: string[] = [];
  const skippedSlugs: string[] = [];

  for (const name of names) {
    const slug = slugifyBrandName(name);
    const [exists] = await db
      .select({ id: schema.brands.id })
      .from(schema.brands)
      .where(eq(schema.brands.slug, slug))
      .limit(1);

    if (exists) {
      skipped++;
      skippedSlugs.push(slug);
      continue;
    }

    const dom = DOMAIN_OVERRIDES[slug] ?? `${slug.replace(/-/g, "")}.com`;
    const website = dom.startsWith("http") ? dom : `https://${dom}`;
    const total = rnd(20, 180);
    const resolvedPct = rnd(8, 35);
    const resolved = Math.round((total * resolvedPct) / 100);

    await db.insert(schema.brands).values({
      slug,
      name,
      categoryId: cat.id,
      website,
      city: "İstanbul",
      logoUrl: logoUrl(name, slug),
      verified: false,
      premium: false,
      rating: (rnd(18, 34) / 10).toFixed(2),
      ratingCount: rnd(8, 120),
      totalComplaints: total,
      complaintsResolved: resolved,
      resolutionRate: resolvedPct,
      avgResponseMinutes: rnd(90, 1800),
      isActive: true,
    });

    added++;
    addedNames.push(name);
  }

  return { listSize: names.length, added, skipped, addedNames, skippedSlugs };
}
