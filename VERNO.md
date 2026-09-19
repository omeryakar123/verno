# verno — proje rehberi

**verno** bağımsız bir Bulgar şikayet ve çözüm platformudur. Tüketiciler markalara şikayet yazar, markalar resmi yanıt verir, süreç herkese açık izlenir. Canlı domain: [verno.bg](https://verno.bg).

Ürün tepkimvar.com’dan ayrılmıştır. Dil, marka ve içerik Bulgarcadır; altyapı (auth, şikayet akışı, marka paneli, bot) aynı ailede kalır.

Bu dosya üç yüzeyi anlatır:

1. **Web masaüstü** — `src/` (TanStack Start)
2. **Web mobil** — aynı site, `lg` altı kırılımlar
3. **iOS** — `appmobile/` (Expo 57 + Expo Go / Simulator)

---

## 1. Ne işe yarar

Kullanıcı bir sorun yazar. Şikayet moderasyondan geçer, markaya düşer, yanıt ve çözüm oranı herkese görünür. Destek (Подкрепи) oyları, yorumlar, zaman çizelgesi ve memnuniyet puanı kaydı tutulur.

**Roller**

| Rol | Ne yapar |
| --- | --- |
| `user` | Şikayet yazar, destekler, yorumlar, profilini yönetir |
| `brand` | Marka paneli: yanıt, mesaj, istatistik, Pro üyelik |
| `moderator` | İnceleme ve yaptırım |
| `admin` / `super_admin` | Markalar, kullanıcılar, bot, CMS, premium, doğrulama |

**Şikayet durumları** (UI ↔ DB)

| Ekranda | DB |
| --- | --- |
| Чака одобрение | `pending` |
| Нова | `approved` |
| В преглед | `in_review`, `user_replied`, `super_admin_review`, `escalated` |
| Отговорена | `answered` |
| Решена | `resolved` |
| Затворена | `rejected`, `spam`, `archived` |

Puan 1–5 yıldızdan 100’lük skora çevrilir (`ortalama / 5 × 100`). Yalnızca çözülen şikayetler marka ortalamasını besler.

---

## 2. Monorepo

```
verno/
├── src/                    Web + API (TanStack Start)
│   ├── routes/             Sayfalar ve /api/*
│   ├── components/         UI (home, cards, chrome, …)
│   ├── lib/                data, seo, auth, placeholder
│   └── styles.css          Tailwind v4 + tema tokenları
├── appmobile/              Expo iOS / Android istemcisi
│   ├── app/                Expo Router ekranları
│   └── src/                bileşenler, API istemcisi
├── packages/shared/        Ortak renk, tip, durum, format
├── public/                 Logo, hero görselleri, mühür
├── drizzle/                Şema / migration
└── VERNO.md                Bu dosya
```

Web `npm workspaces` ile `@verno/shared` kullanır. iOS aynı paketi `file:../packages/shared` ile bağlar. Renk kaynağı tek yerdir: `packages/shared/colors.json`.

---

## 3. Ortak tema (`@verno/shared`)

| Token | Hex | Kullanım |
| --- | --- | --- |
| brand | `#1EC9B8` | CTA, Подкрепи, başarı, teal vurgu |
| brand hover | `#2ED9C8` | Hover |
| brand soft | `#E7FBF8` | Soft buton / rozet zemin |
| primary | `#695DE9` | Mor vurgu, nav CTA, bazı başlık bantları |
| paper | `#F7F8FC` | Sayfa zemini |
| ink / inkDeep | `#0B0D12` / `#10141F` | Metin |
| navy / navy-mid | `#4A5168` / `#7A8196` | İkincil metin |

Public site her zaman açık temadır. `html.dark` (sistem tercihi) kartları karartmasın diye `_site` ve `_corporate` sarmalayıcıları `data-theme="light"` taşır; `styles.css` hem `--ink` hem `--color-ink` override eder.

iOS `userInterfaceStyle: light` ile kilitlidir.

---

## 4. Web (masaüstü)

**Stack:** TanStack Start + Router, React 19, Vite 8, Tailwind v4, Drizzle + Postgres, Better Auth, S3/MinIO, Nitro.

Yerel geliştirme genelde `http://127.0.0.1:8083` üzerindedir (`npm run dev -- --port 8083`).

### 4.1 Yüzeyler

| Layout | URL’ler | Kim |
| --- | --- | --- |
| `_site` | `/`, `/sikayetler`, `/sikayet/:id`, `/firma/:slug`, kurumsal sayfalar | Ziyaretçi + üye |
| `_corporate` | `/kurumsal-uyelik` | Marka satış landing |
| `(auth)` | `/login`, `/register`, OTP, şifre sıfırlama | Herkes |
| `/brand` | Marka paneli | `brand` + admin |
| `/admin` | Yönetim | `admin`, `super_admin` |

### 4.2 Public sayfalar

- **Ana sayfa `/`**
  - Hero: “За решение” + wordmark (`/mainlogo.png`), arama
  - Masaüstü kolaj: `phone / sit / celebrate` fotoğrafları + banner SVG + dekoratif daireler (`h-[640px]` / XL `h-[760px]`)
  - Жалби в дневния ред — yatay marquee
  - Най-обсъждани — mor bant + swiper
  - Успех в решаването — çözüm sıralaması + progress bar
  - Награди — mühür (`/home/seal.png`), alt yazı yok
  - verno в цифри — istatistik kartları
  - Trend 100 — yatay swiper (sayfayı uzatmaz)
  - Marka CTA bandı
- **Жалби** `/sikayetler` — filtre, sıralama, listing kartları, aynı agenda şeridi
- **Detay** `/sikayet/:id` — gövde, destek, yazışma bubble, zaman çizelgesi, yorum, benzer şikayetler
- **Trend 100** `/trend-100`, **markalar** `/markalar`, **kategori** `/kategori/:slug`, **arama** `/arama`
- **Kurumsal:** hakkımızda, yardım, iletişim, reklam, şeffaflık, KVKK/GDPR, gizlilik, kullanım
- Blog rotaları durur; menüden geçici olarak çıkarılmıştır

Boş / henüz yayınlanmamış şikayetlerde placeholder kayıtlar (`ph-*`) gösterilir. Destek tıklanınca “örnek kayıt” toast’ı çıkar.

### 4.3 Üye + paneller

**Üye:** şikayet yaz (`/sikayet-yaz`), profil, bildirimler, desteklediklerim, şikayetlerim.

**Marka paneli `/brand`:** tablo, şikayet yanıtı, mesajlar, profil, Pro.

**Admin `/admin`:** markalar, kategoriler, şikayetler, AI asistan, complaint bot, kullanıcılar, moderasyon, eskalasyon, doğrulama, premium, blog, medya, CMS, ayarlar.

### 4.4 API (iOS de bunları kullanır)

Örnek uçlar: `/api/me`, `/api/stats`, `/api/live-feed`, `/api/home-agenda`, `/api/home-talked`, `/api/complaints`, `/api/complaints/support`, `/api/brands`, `/api/brands/trend`, `/api/categories`, `/api/comments/*`, `/api/notifications`, `/api/upload`, `/api/auth/*`.

Auth: Better Auth (e-posta, OAuth, e-posta OTP, telefon OTP). Cookie tabanlı oturum; Expo istemcisi `@better-auth/expo` ile aynı backend’e bağlanır.

---

## 5. Web mobil (`< lg`, ~1024px altı)

Ayrı bir PWA değil: **aynı React uygulaması**, Tailwind kırılımlarıyla.

| Alan | Masaüstü | Telefon / dar web |
| --- | --- | --- |
| Nav | Logo + linkler + giriş + “Напиши жалба” | Logo, “+ Жалба”, arama ikonu, hamburger |
| Hero | İki kolon: metin + büyük kolaj | Üstte mobile banner SVG + 3 kişi karesi; arama ikon butonu |
| Dekor daireler | Hero grid içinde | Gizli (`lg:block`) |
| Agenda / talked | Geniş kart + oklar | Tam genişlik kaydırma, `min(86vw, …)` kart |
| Trend / sıralama | Grid / geniş satır | Tek kolon, sıkı padding |
| Şikayet listesi | Büyük listing-card | Aynı kart, daha dar padding |
| Footer | Çok kolon | Tek kolon yığılır |

Zorunlu kurallar (son sprint):

- Başlıklar sola hizalı (`text-left`)
- Имена / заглавия koyu `#10141F` — beyaz zemin üstünde beyaz yazı yok
- Подкрепи teal (`bg-brand-soft text-brand`), siyah değil
- Thread bubble beyaz / `#F4F6FB`, yazı koyu
- Public sayfada `bg-card` light token’a kilitli

Canlı sohbet (Tawk) siteden kaldırıldı.

---

## 6. iOS uygulaması (`appmobile/`)

**Stack:** Expo SDK 57, React Native 0.86, Expo Router 57, NativeWind (Tailwind 3), Better Auth Expo, `bg.verno.app`.

Uygulama adı **Verno**, scheme `verno://`. Portrait, tablet destekli, light UI.

Metro varsayılanı `8081`. Backend URL `EXPO_PUBLIC_API_URL`; `preios` / `prestart` script’i LAN IP + açık Verno portunu (8083 → 8080 → …) yazar.

### 6.1 Ekranlar

| Rota | Ekran |
| --- | --- |
| `(tabs)/complaints` | Ana şikayet akışı: arama, kategori, durum, sıralama, agenda carousel, kart listesi, sayfalama |
| `(tabs)/profile` | Oturum, rozetler, istatistik, e-posta/telefon doğrulama, destek hattı |
| `(tabs)/pro` | Marka / Pro satış |
| `complaint/[id]` | Detay |
| `brand/[slug]` | Marka profili |
| `new-complaint` | Şikayet yaz (kamera / galeri — `expo-camera`, `expo-image-picker`) |
| `auth/login`, `auth/register` | Modal auth |
| `my-complaints`, `supported`, `saved`, `my-comments` | Kullanıcı listeleri |
| `notifications` | Bildirimler |
| `help`, `transparency-report`, `info/[slug]` | Yardım / şeffaflık / CMS |
| `verify-email`, `verify-phone`, `edit-field` | Doğrulama ve alan düzenleme |
| `menu` | Alttan açılan menü |

Ana sayfa blokları web ile hizalıdır: hero arama, kolaj, agenda, talked, ranking, awards, stats, Trend 100 — `appmobile/src/components/home/*`.

API yoksa veya boşsa **placeholder / demo** gösterilir (`complaint-placeholders`, `home-placeholders`).

### 6.2 Yerel iOS

```bash
# 1) Web API
cd /Users/omer/Desktop/verno
npm run dev -- --port 8083 --host 127.0.0.1

# 2) Expo + Simulator
cd appmobile
npm run ios
```

- Script `EXPO_PUBLIC_API_URL=http://<LAN-IP>:8083` yazar. Simulator / cihaz aynı ağda olmalı; `localhost` fiziksel telefonda çalışmaz.
- Xcode 27’de Simulator, **Device Hub** ile açılır. Eski `Simulator.app` yolu yok.
- Simulator renkleri bozulursa **Increase Contrast** kapalı olsun.
- Port çakışması: 8080 başka süreç (eski tepkimvar / crypto-engine) olmasın; Verno 8083, Metro 8081.

Bundle id: `bg.verno.app`. Android paket adı aynı; bu belge iOS odaklıdır.

---

## 7. Veri ve altyapı

- **Postgres** — Drizzle (`npm run db:migrate`, `db:studio`). Prod / uzak örnek: ayrı `DATABASE_URL`.
- **Better Auth** — `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `TRUSTED_ORIGINS`. Mobil için `MOBILE_APP_SCHEMES=verno`.
- **S3 / MinIO** — kanıt görseli ve video.
- **E-posta** — Nodemailer (OTP, hatırlatma).
- **Complaint bot** — fal.ai / OpenRouter; sentetik şikayet (varsayılan gizli). Admin + cron.
- **SEO** — `SITE_URL` / `VITE_SITE_URL` → sitemap, robots, OG, JSON-LD. Canonical `https://verno.bg`.

---

## 8. Komutlar

| Ne | Nerede | Komut |
| --- | --- | --- |
| Web | repo kökü | `npm run dev` (port 8083 önerilir) |
| Build | kök | `npm run build` |
| Lint / format | kök | `npm run lint` / `npm run format` |
| iOS | `appmobile/` | `npm run ios` |
| Expo genel | `appmobile/` | `npm start` / `npm run start:lan` / `start:tunnel` |
| Android | `appmobile/` | `npm run android` (ayrı iş) |

Lovable bağlıdır: **force-push / rebase / squash** yapılmaz; geçmiş Lovable tarafında kaybolur.

---

## 9. Üç yüzeyin farkı

| | Web masaüstü | Web mobil | iOS |
| --- | --- | --- | --- |
| Kod | `src/` | `src/` (aynı) | `appmobile/` |
| Router | TanStack file routes | aynı | Expo Router |
| Stil | Tailwind v4 `@theme` | aynı + `md`/`lg` | NativeWind v3 |
| Nav | sticky header | hamburger | tab + stack + modal menü |
| Hero | büyük kolaj + blob | mobile banner SVG | RN kolaj / arama bileşenleri |
| Auth | cookie | cookie | SecureStore + Expo auth |
| Admin / marka paneli | var | dar web’de var | yok (tüketici app) |
| Offline | yok | yok | placeholder / hata state |
| Tema | light kilit (public) | aynı | light kilit |

Paylaşılan gerçekler: palet, durum etiketleri, 100’lük skor, API şekli, placeholder şikayetler, Bulgarca copy.

---

## 10. Bilinen sınırlar (Eylül 2026)

- Public içerik hâlâ kısmen placeholder; gerçek yayın akışı backend + moderasyona bağlı.
- Web blog menüden gizlendi, rotalar duruyor.
- iOS `(tabs)` altında `_layout` yok; tab bar Expo varsayılanıyla gelir — web header ile birebir değil.
- Shared `VERNO_DEV_PORT` hâlâ 8080 yazıyor; pratikte web 8083, Expo script 8083’ü önce dener.
- `.env.example` bazı satırlarda eski tepkimvar domain örneği taşır; canlı site verno.bg’dir.

---

## 11. Hızlı kontrol listesi

1. Web: `http://127.0.0.1:8083/` — hero logo, kolaj, sola hizalı başlıklar, teal Подкрепи, koyu isim/başlık.
2. Web dar: hamburger, mobile hero, kayan agenda.
3. `/sikayetler` ve `/sikayet/ph-1` — beyaz kart, koyu yazı, açık bubble.
4. iOS: Expo Go veya Simulator, API URL LAN:8083, kontrast kapalı, şikayet listesi + detay + login.

Sorun çıkarsa önce port (8083 vs 8080 vs 8081), sonra `html.dark` / light token, sonra `EXPO_PUBLIC_API_URL` bak.
