# verno — yapay zeka el kitabı

Bu dosya, projeyi **hiç görmemiş bir yapay zekanın** doğru yerden devam etmesi içindir. Önce burayı oku; sonra koda dokun.

**Canlı site:** [https://verno.bg](https://verno.bg)  
**Repo kökü:** `/Users/omer/Desktop/verno`  
**Tarih (bağlam):** Eylül 2026

---

## 0. Bu projeyi nasıl ele al

1. Kullanıcı Türkçe konuşur; **kullanıcıya görünen tüm metin Bulgarcadır**. Yeni copy, toast, rozet, boş durum, e-posta konusu — hepsi BG.
2. Web UI açık temadır: teal `#1EC9B8` + mor `#695DE9`. Siyah kart / koyu hero / “AI ikon kuyusu” ekleme.
3. **`appmobile/` dokunma** — kullanıcı açıkça iOS istemedikçe.
4. **8083 (Vite) ve 8081 (Metro) süreçlerini öldürme.** Sunucu zaten çalışıyorsa yeniden başlatma.
5. Lovable bağlıdır: **force-push, rebase, amend, squash yok.** Geçmiş Lovable tarafında kaybolur. Commit yalnızca kullanıcı isterse.
6. Eski ürün **tepkimvar.com** (Türkçe). Bu repo ondan ayrıldı. Kalan TR string / tepkimvar domain / `#272635` siyah kart = borç; yeni kod üretme.
7. URL path’leri hâlâ Türkçe (`/sikayetler`, `/firma/$slug`, `/hakkimizda`). Değiştirme — SEO ve mevcut linkler kırılır. Sadece görünen yazı BG.
8. Kod yorumları TR kalabilir. Kullanıcıya dönen her şey BG.
9. **Gerçek şirket adına uydurma içerik üretme.** Placeholder, seed, demo veya bot — hiçbirinde gerçek marka adı, logosu, puanı veya "resmi yanıtı" olamaz. Örnek markalar `ph-` slug'lı ve `(пример)` etiketlidir (`src/lib/placeholder-complaints.ts`).
10. **`SITE_NOINDEX=true`** — şirket tescil edilip gerçek içerik girene kadar açık kalır. Kapatma kararı kullanıcınındır.

---

## 1. Ürün nedir

**verno** bağımsız bir Bulgar şikayet ve çözüm platformudur.

Tüketici bir sorun yazar → moderasyon → markaya düşer → resmi yanıt / çözüm herkese görünür. Destek oyu (Подкрепи), yorum, yazışma, zaman çizelgesi, 1–5 yıldız memnuniyet puanı vardır. Puan **yalnızca çözülen** şikayetlerde marka ortalamasına girer; 100’lük skor `ortalama / 5 × 100`.

Sıralama (Успех в решаването) **çözüm oranına** bakar; firma büyüklüğü veya şikayet sayısı sıralamaz.

### Roller (`app_role`)

| Rol | Ne yapar |
| --- | --- |
| `user` | Şikayet yazar, destekler, yorumlar, marka takip eder |
| `brand` | `/brand` paneli: yanıt, mesaj, istatistik, Pro |
| `moderator` | İnceleme, yaptırım |
| `admin` / `super_admin` | `/admin`: markalar, kullanıcılar, bot, CMS, doğrulama, premium |

### Şikayet durumları

DB enum → UI (`@verno/shared` + `src/lib/mock-data.ts`):

| Ekran (BG) | UI anahtar | DB |
| --- | --- | --- |
| Чака одобрение | `beklemede` | `pending` |
| Нова | `yeni` | `approved` |
| В преглед | `inceleniyor` | `in_review`, `user_replied`, `super_admin_review`, `escalated` |
| Отговорена | `yanitlandi` | `answered` |
| Решена | `cozuldu` | `resolved` |
| Затворена | `kapatildi` | `rejected`, `spam`, `archived` |

---

## 2. Monorepo

```
verno/
├── src/                      Web + API  (TanStack Start)
│   ├── routes/               Sayfalar + /api/*   (file-based)
│   ├── routes/__root.tsx     Tek kök layout
│   ├── components/           UI
│   ├── lib/                  data, seo, auth, placeholder
│   ├── db/                   Drizzle şema + seed
│   ├── styles.css            Tailwind v4 + light lock
│   └── server.ts             CORS / Nitro giriş
├── appmobile/                Expo iOS (kullanıcı söylemeden dokunma)
├── packages/shared/          Renk, durum, format
│   └── colors.json           Tek palet kaynağı
├── public/                   /mainlogo.png, /home/seal.png, /brand-logos, hero
├── drizzle/                  Migration
├── AGENTS.md                 Lovable: geçmişi yeniden yazma
└── VERNO.md                  Bu dosya
```

- Web: npm workspaces → `@verno/shared`
- iOS: `file:../packages/shared`
- **Next.js / Remix layout konvansiyonu yok.** `src/pages/` veya `app/layout.tsx` açma. `routeTree.gen.ts` elle edilmez.

---

## 3. Stack

| Katman | Seçim |
| --- | --- |
| Web framework | TanStack Start + TanStack Router, React 19 |
| Bundler | Vite 8, plugin `@lovable.dev/vite-tanstack-config` |
| Sunucu | Nitro (prod `PORT`, lokal Vite) |
| CSS | Tailwind **v4** (`src/styles.css` `@theme`) |
| ORM | Drizzle + Postgres (`postgres` driver) |
| Auth | Better Auth — e-posta/şifre, OAuth, e-posta OTP, telefon OTP |
| Depolama | S3/MinIO veya `STORAGE_BACKEND=local` |
| Mail | Resend (öncelik) / SMTP; lokalde konsola OTP |
| SMS | Sempico |
| AI bot | fal.ai / OpenRouter — sentetik şikayet (varsayılan gizli) |
| iOS | Expo 57, RN 0.86, Expo Router, NativeWind **v3**, scheme `verno://` |
| Test | Vitest (`npm test`) — saf mantık: rate limit, metrik, telefon, trusted origin |

Lokal web: **`http://127.0.0.1:8083`**  
`npm run dev -- --port 8083 --host 0.0.0.0`  
Expo Metro: **8081**. Expo’nun API’ye ulaşması için Vite `0.0.0.0:8083` dinlemeli; yalnızca `127.0.0.1` olursa LAN fail olur.

---

## 4. Tema — en sık kırılan yer

Kaynak: `packages/shared/colors.json`

| Token | Hex | Kullan |
| --- | --- | --- |
| brand | `#1EC9B8` | CTA, Подкрепи, başarı |
| brand hover | `#2ED9C8` | Hover |
| brand soft | `#E7FBF8` | Soft zemin |
| primary | `#695DE9` | Mor vurgu, nav “+ Жалба”, auth aside |
| paper | `#F7F8FC` | Sayfa zemini |
| ink / inkDeep | `#0B0D12` / `#10141F` | Metin |
| navy / navy-mid | `#4A5168` / `#7A8196` | İkincil metin |
| media | `#10141F` | Footer / koyu bant (bilinçli) |

**Tuzak:** `html.dark` (sistem tercihi) `text-ink`’i beyaz, `bg-card`’ı koyu yapar. Public sitede beyaz-üstüne-beyaz veya siyah input üretir.

**Kilit:**

- `_site` ve `_corporate` sarmalayıcı: `data-theme="light"`
- Auth kabuğu + marka başvuru: `data-theme="light"`
- `src/styles.css` içinde `[data-page="home"], [data-theme="light"]` hem `--ink` hem `--color-ink` override eder
- Footer koyu (`bg-media`). Hover **`hover:text-white`**. `dark:hover:text-ink` kullanma — ink light lock’ta siyah, footer’da yazı kaybolur
- Auth / form input: mümkünse `bg-white text-[#10141F]`, `text-ink` / `bg-card`’a güvenme
- iOS: `userInterfaceStyle: light`

Dekor: teal/mor/sarı (`#F5D76E`) daireler. Metnin üstüne bindirme; köşeye it.

Yasak görsel kalıplar (kullanıcı reddetti):

- Lucide ikon + `bg-brand-soft` kare kuyu (“AI generate”)
- `#272635` / `bg-ink-deep` kurumsal kart (temaya çek: beyaz veya `bg-primary`)
- Sparkles ikonu CTA’da
- İngilizce / Türkçe form copy

---

## 5. Dil ve copy

- **UI dili:** Bulgarca (`bg-BG` locale, `toLocaleString("bg-BG")`)
- İletişim: `info@verno.bg` (`src/lib/contact.ts`)
- Site adı: `verno` (`src/lib/seo.ts`)
- Wordmark: `/mainlogo.png` (`HomeWordmark`, `SiteLogoMark`)
- Süre: `dk`/`s`/`g` değil → **`мин` / `ч` / `д`** (`formatResponseTime`)
- Takip: `Takip et` değil → **Следване / Следвате**
- Rozetler: Потвърден потребител, Първа жалба, Активен жалбоподател, Доволен потребител
- Sentetik yorumlar: `src/lib/server/talked-preview-comments.ts` — BG şablonlar. TR opener ekleme
- İsimler: `pickBulgarianDisplayName` (`src/lib/server/ai/prompts.ts`). `pickTurkishDisplayName` alias’tır

Path’ler TR kalır:

`/sikayetler` `/sikayet/$id` `/sikayet-yaz` `/firma/$slug` `/hakkimizda` `/iletisim` `/kurumsal-uyelik` `/seffaflik-raporu` `/markalar` `/kategori/$slug` `/arama` `/trend-100`

---

## 6. Web routing

File-based. Layout grupları:

| Layout | URL | Kim |
| --- | --- | --- |
| `_site` | Public + üye sayfaları | Ziyaretçi / user |
| `_corporate` | `/kurumsal-uyelik` | Satış landing |
| `(auth)` | `/login` `/register` `/forgot-password` `/verify-email` | Herkes |
| `/brand` | Marka paneli | `brand` + admin |
| `/admin` | Yönetim | `admin`, `super_admin` |

### Public

| Path | Ne |
| --- | --- |
| `/` | Ana sayfa — hero, agenda, talked, ranking, awards, stats, Trend 100, marka CTA |
| `/sikayetler` | Liste + filtre + listing-card |
| `/sikayet/$id` | Detay (publicId `VN-…` veya UUID) |
| `/firma/$slug` | Marka profili |
| `/markalar` | Marka dizini |
| `/kategori/$slug` | Kategori |
| `/arama?q=` | Arama |
| `/trend-100` | Trend |
| `/hakkimizda` | Hakkımızda |
| `/iletisim` | İletişim formu → mailto |
| `/yardim` `/info/$slug` | Yardım / CMS |
| `/reklam-cozumleri` | Reklam |
| `/seffaflik-raporu` | Şeffaflık (aylık 2026 grafik; platform 2025’te açıldı) |
| `/gizlilik` `/kullanim-kosullari` `/kvkk` | Hukuk |
| `/blog` `/blog/$slug` | Rota durur, menüden gizli |

### Auth

| Path | Ne |
| --- | --- |
| `/login` `/register` | `SikayetvarAuthShell` — sol mor panel + form |
| `/register/marka-basvuru` | Marka başvuru (BG, light tema) |
| `/register/kurumsal` | Kurumsal kayıt |
| `/forgot-password` `/reset-password` `/verify-email` | OTP / sıfırlama |

### Üye (`_site`)

`/sikayet-yaz` `/profilim` `/sikayetlerim` `/desteklediklerim` `/yorumladiklarim` `/bildirimlerim`

### Marka `/brand`

Tablo, şikayet yanıtı, mesajlar, profil, Pro.

### Admin `/admin`

firmalar, kategoriler, şikayetler, AI asistan, bot, kullanıcılar, moderasyon, eskalasyon, doğrulama, premium, blog, medya, CMS, ayarlar.

---

## 7. Ana sayfa blokları (`src/routes/_site/index.tsx`)

Sıra:

1. `HeroSection` — “За решение” + wordmark, arama, kolaj (`phone` / `sit` / `celebrate`) + blob’lar
2. `AgendaMarquee` — Жалби в дневния ред
3. `TalkedCarousel` — Най-обсъждани
4. Ranking — `bg-ink-deep`, “Успех в решаването”, blob’lar **metni kapatmamalı**
5. `#awards` — `HomeAwardsSeal` (`/home/seal.png`, büyük: `w-80` / `lg:w-[26rem]`)
6. Stats — “verno в цифри”
7. `TrendStrip` — logo **yuvayı doldurur** (`BrandListLogo` `size-full`, az padding)
8. Mor CTA — marka başvuru

Boş veri: `brandsOrPlaceholders` / `complaintsOrPlaceholders` (`ph-*` id). Destek tıklanınca örnek kayıt toast’ı.

---

## 8. Auth

`src/lib/auth.ts` — Better Auth + Drizzle adapter + Expo plugin.

- E-posta/şifre, `requireEmailVerification: false`
- OAuth: Google / Facebook / Apple (env + `VITE_OAUTH_*`)
- OTP e-posta: kayıt akışında `/api/otp`; Better Auth `emailOTP` yalnız şifre sıfırlama
- Telefon: `PhoneInput` + `+359`, `toE164Tr` (isim tarihi, BG numara formatlar)
- Cookie oturum. Mobil: `@better-auth/expo` + SecureStore
- Trusted origins: `src/lib/auth-urls.ts` — `verno.bg`, localhost **8083**, Expo 8081 CORS (`src/lib/server/mobile-cors.ts`)

Kabuk: `src/components/auth-form-sikayetvar.tsx`

- Sol aside: `bg-primary`, logo üstte, slogan **logo altında** (alta yaslama — okunmaz)
- Tek OAuth sağlayıcıysa buton `max-w-[280px] mx-auto`
- Form `text-[#10141F]`, input beyaz

### Lokal demo hesap (Eylül 2026’da açıldı)

```
e-posta: demo@verno.bg
şifre:   Demo1234!
```

Normal `user`. Prod’da olmayabilir. Admin değil.

---

## 9. Veri modeli (özet)

Drizzle: `src/db/schema.ts`. Önemli tablolar:

- `user`, `session`, `account`, `verification` — Better Auth
- `profiles`, `user_roles`
- `brands`, `brand_members`, `categories`
- `complaints` (+ publicId `VN-…`, status, views, votes, firstResponseMinutes)
- `comments`, `complaint_replies`, `complaint_resolutions`, `complaint_supports`
- `attachments` (görünürlük enum)
- `escalations`, `reports`, `notifications`
- `brand_follows`
- bot config / synthetic flag

Komutlar: `npm run db:generate` `db:migrate` `db:studio`

Seed (`src/db/seed.ts`) artık **yalnızca Bulgarca kategori** ekler; hiçbir şey silmez ve uydurma marka/şikayet yazmaz. `SEED_CONFIRM=yes` olmadan çalışmaz. (Eski sürüm tüm şikayet/marka/kategori tablolarını silip Türkçe demo veri yazıyordu.)

Sentetik bot şikayetleri varsayılan **gizli** (`SYNTHETIC_CONTENT_PUBLIC=false`).

---

## 10. API (iOS de bunları kullanır)

Better Auth: `/api/auth/*`

Örnekler:

| Uç | İş |
| --- | --- |
| `/api/me` `/api/profile` | Oturum / profil |
| `/api/stats` | Platform sayıları |
| `/api/live-feed` `/api/home-agenda` `/api/home-talked` | Ana sayfa |
| `/api/complaints` `/api/complaints/$id` | Liste / detay |
| `/api/complaints/support` | Подкрепи |
| `/api/brands` `/api/brands/$slug` `/api/brands/trend` | Markalar |
| `/api/brands/$slug/follow` | Следване |
| `/api/comments` `.../vote` `.../pin` | Yorum (+ preview generator) |
| `/api/complaint-replies` | Marka yazışması |
| `/api/notifications` `/api/upload` `/api/search` | Üye |
| `/api/events/$complaintId` | SSE |
| `/api/otp/*` | E-posta / telefon OTP |
| `/api/admin/*` `/api/brand/*` | Paneller |
| `/api/cron/complaint-bot` | `Authorization: Bearer $CRON_SECRET` |

İstemci şekilleri: `src/lib/data.ts`, `src/lib/db-shapes.ts`.

---

## 11. Önemli UI dosyaları

| Dosya | Görev |
| --- | --- |
| `src/components/site-chrome.tsx` | Header + footer |
| `src/components/site-logo-mark.tsx` | Logo |
| `src/components/cards.tsx` | `BrandListLogo`, `ComplaintCard`, şirket kartı |
| `src/components/home/*` | Hero, agenda, talked, trend, mühür |
| `src/components/home/complaint-feed-card.tsx` | Listing — **logo + marka adı yan yana** |
| `src/components/brand-follow-button.tsx` | Следване |
| `src/components/complaint-support-button.tsx` | Подкрепи (teal) |
| `src/components/auth-form-sikayetvar.tsx` | Login/register kabuğu |
| `src/components/brand-application-form.tsx` | Marka başvuru |
| `src/components/transparency/transparency-report-page.tsx` | Şeffaflık |
| `src/lib/user-badges.ts` | Rozet metinleri |
| `src/lib/mock-data.ts` | `statusLabel`, `formatResponseTime` |
| `src/styles.css` | Token + light lock |

Şikayet detay: `src/routes/_site/sikayet.$id.tsx`  
Marka sayfası: `src/routes/_site/firma.$slug.tsx` — tek takip butonu (`BrandFollowButton`); sahte “Следи” yok.

---

## 12. UI kuralları (son sprint)

- Başlıklar **sola** (`text-left`), hero hariç merkeze çekme
- İsim / başlık `#10141F` — asla beyaz-üstüne-beyaz
- Подкрепи: `bg-brand-soft text-brand`, siyah değil
- Thread bubble: beyaz / `#F4F6FB`, yazı koyu
- Logo: `object-contain`, yuvayı doldur; fazla `p-1.5` + küçük inner size keser
- Listing’de marka = küçük logo + isim
- Footer hover: açık renk, `dark:hover:text-ink` yok
- Şeffaflık grafiği: **aylık 2026** (Яну–Сеп). 2021–2025 yıllık uydurma yok. Çubuk `height:%` için ebeveyn `h-56` + iç `flex-1` şart; yoksa çubuk çöker
- Numaralı adım / teal çubuk > Lucide kutu
- Tawk / canlı sohbet yok

---

## 13. iOS (`appmobile/`) — yalnız istenirse

- Expo 57, bundle `bg.verno.app`, light UI
- `preios` → `EXPO_PUBLIC_API_URL=http://<LAN-IP>:8083`
- Simulator / cihaz **aynı LAN**; fiziksel telefonda `localhost` çalışmaz
- Tab’lar: complaints / profile / pro + stack (detay, auth, yardım)
- API boşsa placeholder
- Shared `VERNO_DEV_PORT` hâlâ 8080 yazıyor olabilir; pratik: web 8083, Metro 8081

```bash
# Web (kök) — zaten 8083’teyse tekrar başlatma
npm run dev -- --port 8083 --host 0.0.0.0

# iOS
cd appmobile && npm run ios
```

---

## 14. Ortam

`.env.example` bazı satırlarda hâlâ `localhost:8080` ve tepkimvar örneği taşır. Canlı: **verno.bg**.

Zorunlu: `DATABASE_URL`, `BETTER_AUTH_SECRET`  
Lokal pratik: `BETTER_AUTH_URL` / `SITE_URL` / `TRUSTED_ORIGINS` → `http://localhost:8083`  
Prod: `https://verno.bg`, `TRUSTED_ORIGINS` apex + www  
SEO: `SITE_URL` + `VITE_SITE_URL` (build-time)  
Depolama: S3 veya local disk. Bucket adı tarihi: `itirazvar`  
Mail / SMS / OAuth / `CRON_SECRET` / `AI_API_KEY` opsiyonel-zorunlu (prod)

Deploy: Coolify. Ayrıntı `DEPLOY.md`, `DEPLOY-SSH.md`.

---

## 15. Komutlar

| İş | Nerede | Komut |
| --- | --- | --- |
| Web | kök | `npm run dev -- --port 8083 --host 0.0.0.0` |
| Build | kök | `npm run build` |
| Lint / format | kök | `npm run lint` / `npm run format` |
| Test | kök | `npm test` (50 test) |
| DB | kök | `npm run db:migrate` / `db:studio` |
| iOS | `appmobile/` | `npm run ios` |

Commit: kullanıcı isterse, hook atlama, force-push yok.

---

## 16. Bilinen tuzaklar

1. **`html.dark` + `text-ink`** → beyaz yazı / siyah input. `data-theme="light"` + düz hex.
2. **Footer `dark:hover:text-ink`** → siyah hover. `hover:text-white`.
3. **Vite yalnız 127.0.0.1** → Expo LAN fail. `--host 0.0.0.0`.
4. **Grafik `%` yükseklik** flex çocuğunda çöker; sabit yükseklik ver.
5. **Placeholder `ph-*`** gerçek API gibi davranmaz.
6. **Şikayet publicId** ilk SSR’de 404 görünebilir, client hydrate eder (`VN-…`).
7. **Türkçe artık** `talked-preview-comments`, rozet, toast, `Henüz … yok` empty state, `formatResponseTime` `dk/s`. Yeni TR string ekleme; görürsen BG yap.
8. **Siyah kurumsal kart** `#272635` bazı sayfalarda kalmış olabilir (`reklam-cozumleri`, corporate). Temaya çek.
9. **Cover görseli** bazı markalarda hâlâ “tepkimvar” yazabilir — asset, copy değil.
10. **Blog** menüde yok, rota duruyor.
11. **`.env` uzak veritabanını gösterebilir** — lokal sanılan komutlar canlı veriye yazar. `db:migrate` / seed öncesi `DATABASE_URL` host'unu doğrula.
12. Shared port sabiti 8080 yanıltır.

---

## 17. Son durum (Eylül 2026)

Yapıldı (web):

- Ana sayfa: büyük hero, wordmark, blob, sola başlık, teal Подкрепи
- Ranking blob’ları metni kapatmayacak şekilde köşede
- Auth light + mor aside, slogan yukarıda, Google ortalı, telefon input beyaz
- Marka başvuru BG + tema
- Şeffaflık aylık grafik + dolu CTA
- Listing logo+isim, takip BG, süre `ч`, yorum şablonları BG
- Footer hover düzeltmesi

Lokal demo: `demo@verno.bg` / `Demo1234!`

Açık borç (bilinçli):

- Kalan TR empty state / admin / bot prompt
- `.env.example` tepkimvar örnekleri
- Blog gizli
- iOS tab bar web header ile 1:1 değil
- Public içerik kısmen placeholder + sentetik

---

## 18. Yeni işe başlarken

1. Bu dosyayı oku.
2. İlgili rotayı ve layout’u (`_site` / auth / brand) aç.
3. `data-theme="light"` var mı bak.
4. Kullanıcıya görünen string BG mi bak.
5. Web değiştiyse dar (`< lg`) ve ilgili diğer sayfayı da kontrol et.
6. `appmobile`’a dalma.
7. 8083/8081’i öldürme.
8. Lovable geçmişini yeniden yazma.

Şüphede: **açık zemin, teal CTA, mor vurgu, koyu `#10141F` metin, Bulgarca.**
