# ORVEN MEDIA — Rivojlanish va Holat Hujjati (PROGRESS.md)

Ushbu hujjat "ORVEN MEDIA" to'liq ishlaydigan anime va donghua streaming platformasining qurilish jarayoni, yakunlangan qismlari hamda ishga tushirish qo'llanmasini o'z ichiga oladi.

---

## 1. Loyiha Haqida va Arxitektura
- **Nomi**: ORVEN MEDIA
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion
- **Ma'lumotlar bazasi**: Prisma ORM (SQLite hozirda `dev.db`, production uchun PostgreSQL ga 1 qadamda o'tish imkoni)
- **Autentifikatsiya**: Auth.js / NextAuth v5 (Email + Parol bcrypt, Google OAuth tayyorligi, JWT sessiyalar)
- **Player**: Maxsus yaratilgan hls.js + HTML5 video player (subtitrlar, sifat, tezlik, intro/outro o'tkazish, klaviatura boshqaruvi, vaqt eslab qolish)
- **Admin**: AniList GraphQL API orqali to'g'ridan-to'g'ri import, to'liq CRUD, video va subtitr yuklash, moderatsiya, audit log
- **Dizayn**: Qora (#0b0b0d), qirrali (0-2px burchaklar), jiddiy kinematografik minimalizm, film grain, Space Grotesk / Inter shriftlari

---

## 2. Ishga Tushirish (Localhost)

```bash
# 1. Loyiha papkasiga o'tish
cd d:/claudewebsite/orven-media

# 2. Prisma bazasini sinxronlash va generatsiya qilish
npm run prisma:push
npm run prisma:generate

# 3. Ma'lumotlar bazasini seed qilish (AniList'dan 40 ta anime, 15 ta donghua, admin, foydalanuvchilar)
npm run prisma:seed

# 4. Loyihani ishlab chiqarish rejimida build qilish
npm run build

# 5. Dasturni ishga tushirish
npm run start # yoki npm run dev
```

Sayt manzili: `http://localhost:3000`
Standart Admin:
- Email: `admin@orven.media`
- Parol: `Admin123!`

Standart Foydalanuvchi:
- Email: `user@orven.media`
- Parol: `User123!`

---

## 3. Bosqichlar Holati

### 1-bosqich: Loyiha poydevori va Ma'lumotlar bazasi [YAKUNLANGAN]
- [x] Next.js 16 loyihasi o'rnatildi va TypeScript/Tailwind CSS v4 sozlandi
- [x] Prisma to'liq sxemasi (`prisma/schema.prisma`) yaratildi: 21 ta model
- [x] Prisma Client generatsiya qilindi va `dev.db` bazasiga jadvallar kiritildi (`prisma db push`)
- [x] `.env` va `.env.example` sozlandi
- [x] `src/lib/db.ts` (Prisma singleton)
- [x] `src/lib/constants.ts`, `src/lib/utils.ts`, `src/lib/validations.ts`, `src/lib/storage.ts`, `src/lib/rate-limit.ts`, `src/lib/api.ts`, `src/lib/auth.ts`
- [x] `src/middleware.ts` va `src/app/globals.css` (qora qirrali dizayn tizimi, film grain, skrollbar)

---

### 2-bosqich: UI Komponentlar Tizimi [YAKUNLANGAN]
- [x] 20+ ta maxsus UI komponent: `Button`, `Input`, `Textarea`, `Select`, `Modal`, `Dropdown`, `Toast`, `Skeleton`, `Badge`, `Avatar`, `Tabs`, `Pagination`, `Rating`, `ProgressBar`, `Toggle`, `Spinner`, `EmptyState`, `FileUpload`, `ConfirmDialog`, `Tooltip`, `Slider`

---

### 3-bosqich: Layout va Navigatsiya [YAKUNLANGAN]
- [x] `Header.tsx` (Logo, nav links, live search, notification, user dropdown)
- [x] `Footer.tsx`, `MobileNav.tsx` (pastki bar mobil uchun), `SearchOverlay.tsx`
- [x] `RootLayout` va `MainLayout`

---

### 4-bosqich: Anime & Donghua Ko'rsatish Komponentlari [YAKUNLANGAN]
- [x] `AnimeCard.tsx`, `AnimeGrid.tsx`, `AnimeRow.tsx`
- [x] `HeroSlider.tsx` (kinematografik spotlight, parallax, avto o'tish)
- [x] `EpisodeList.tsx`, `EpisodeCard.tsx`
- [x] `TopTenCard.tsx`, `TopTenSection.tsx` (Kun/Hafta/Oy tablari), `ContinueWatchingCard.tsx`, `ScheduleCard.tsx`
- [x] `FilterPanel.tsx`, `CharacterCard.tsx`, `GenreTag.tsx`, `RelatedAnime.tsx`

---

### 5-bosqich: Video Player va Watch Sahifasi [YAKUNLANGAN]
- [x] `VideoPlayer.tsx` (hls.js + MP4, custom boshqaruv paneli)
- [x] Tezlik (0.5x-2x), Sifat tanlash (1080p, 720p...), Subtitrlar (.vtt), PiP, Theater mode, Lights off
- [x] Skip Intro/Outro tugmalari, Auto-play, Auto-next, Ko'rish vaqtini eslab qolish (API bilan sinxron)
- [x] `EpisodeSidebar.tsx`, Server tanlash, buzilgan videoni report qilish
- [x] `src/hooks/usePlayer.ts` va `src/hooks/useWatchHistory.ts`

---

### 6-bosqich: Ijtimoiy Funksiyalar, Izohlar, Profil va Sozlamalar [YAKUNLANGAN]
- [x] `CommentSection.tsx`, `CommentItem.tsx`, `CommentForm.tsx` (nested replies, likes, spoiler hide)
- [x] `WatchlistButton.tsx`, `FavoriteButton.tsx`, `ShareButton.tsx`, `RatingWidget.tsx`
- [x] Profil sahifasi (`/profile/[username]`): banner, avatar, statistika, watchlist tablari, tarix
- [x] Sozlamalar sahifasi (`/settings`): Account, player preferensiyalari, maxfiylik, til
- [x] Bildirishnomalar sahifasi (`/notifications`)

---

### 7-bosqich: Asosiy Sahifalar [YAKUNLANGAN]
- [x] Bosh sahifa (`/` - `src/app/page.tsx`): Hero spotlight slider, Continue Watching, Trending Now, Donghua bo'limi, Recently Updated, New Releases, Top Airing, Most Popular, Explore by Genre paneli, Top 10 (Kun/Hafta/Oy tablari), Bugungi jadval, Header va Footer
- [x] Katalog / Browse (`/browse`)
- [x] Donghua maxsus sahifasi (`/donghua`)
- [x] Anime katalogi (`/anime`)
- [x] Filmlar sahifasi (`/movies`)
- [x] Qidiruv sahifasi (`/search`), Top (`/top`), Random (`/random`), Jadval (`/schedule`)
- [x] Janrlar (`/genres`), Janr bo'yicha saralash (`/genres/[slug]`)
- [x] Anime Batafsil (`/anime/[slug]`) va Tomosha (`/watch/[slug]/[episode]`)
- [x] Kirish (`/login`, `/auth/login`) va Ro'yxatdan o'tish (`/register`, `/auth/register`)
- [x] Qo'shimcha sahifalar: `/request`, `/news`, `/faq`, `/contact`, `/about`, `/terms`, `/privacy`, `/dmca`, 404, 500

---

### 8-bosqich: To'liq Admin Panel (`/admin`) [YAKUNLANGAN]
- [x] Dashboard (statistika, tezkor amallar, oxirgi faoliyat)
- [x] Anime CRUD va AniList GraphQL import modal (bir bosishda barcha ma'lumotlar to'ldirilishi)
- [x] Epizod qo'shish (video yuklash, HLS/MP4, subtitrlar, intro/outro)
- [x] Foydalanuvchilar boshqaruvi (ban, rol almashtirish)
- [x] Izohlar moderatsiyasi, shikoyatlar (reports), e'lonlar, so'rovlar, sayt sozlamalari, audit log

---

### 9-bosqich: Seed ma'lumotlari (AniList orqali 40+ anime va 15+ donghua) [YAKUNLANGAN]
- [x] `prisma/seed.ts` skripti orqali haqiqiy posterlar, tavsiflar, reytinglar, personajlar va sinov epizodlari bilan bazani to'ldirish
- [x] 55 ta serial to'liq yuklandi va sinxronlandi
- [x] Standart admin (`admin@orven.media`) va test foydalanuvchisi yaratildi

---

### 10-bosqich: Docker, Nginx, SEO, PWA & Yakuniy Sinov [YAKUNLANGAN]
- [x] `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `scripts/convert-to-hls.sh`
- [x] `sitemap.ts`, `robots.ts`, `manifest.ts`, `public/icon.svg`
- [x] 33/33 balli chuqur kontent auditi (standart Vercel/Next shablon matnlari yo'qligi va haqiqiy Orven Media anime kontenti mavjudligi tasdiqlandi)
- [x] Server `http://localhost:3000` da to'liq ish holatida

---

### 11-bosqich: Tailwind v4 Stilizatsiya & AniList Rasm Muammolari Tuzatildi [YAKUNLANGAN]
- [x] **Tailwind v4 Kaskad va Padding/Margin**: `globals.css` dagi qatlamsiz `* { margin:0; padding:0; }` qoidalari o'chirilib, barcha element qoidalari (`html`, `body`, `h1..h6`, `a`, `*:focus-visible`) `@layer base` ichiga olindi. `px-4`, `mx-auto`, `p-2`, `max-w-7xl` utility klasslari to'liq ishga tushdi.
- [x] **Hero Slider Yaxshilanishi**: Banner yorqinligi oshirildi (`brightness-80`), qoraytiruvchi gradientlar yumshatildi, chap va o'ng strelkalar sarlavha matni bilan to'qnashmasligi uchun o'ng pastki burchakdagi boshqaruv blokiga joylashtirildi.
- [x] **AniList 404 Rasmlar Muammosi**: `scripts/fix-images.mjs` skripti yozildi va ishga tushirildi. AniList GraphQL orqali 55 ta serial qidirilib, barcha poster va banner URL manzillari HTTP 200 tekshiruvidan o'tkazilib, bazada yangilandi.
- [x] **Rasm Yuklanmaganda Fallback (onError)**: `AnimeCard`, `TopTenCard`, `ScheduleCard`, `EpisodeCard`, `ContinueWatchingCard` va `HeroSlider` komponentlariga `onError` tekshiruvi qo'shildi. Rasm yuklanmasa yoki tarmoq uzilsa, o'tkir burchakli qora "OM" monogramma va anime nomi ko'rinadi.
- [x] **next.config.ts**: `images.remotePatterns` ga `**.anilist.co`, `commondatastorage.googleapis.com` va `media.kitsu.io` qo'shildi.
- [x] **TypeScript Tekshiruvi**: `npx tsc --noEmit` muvaffaqiyatli o'tdi (0 xato).

---

### 12-bosqich: Portfolio & Production Darajasiga Yetkazish (Upwork Ready) [YAKUNLANGAN]
- [x] **0) Audit va Hydration Tuzatish**:
  - `ScheduleCard.tsx` dagi `toLocaleTimeString` vaqt mismatchini oldini olish uchun xavfsiz `useEffect` va `suppressHydrationWarning` qo'shildi.
  - Yo'q bo'lgan `/admin/news` sahifasi (`src/app/admin/news/page.tsx`) va unga xizmat qiluvchi to'liq CRUD API (`src/app/api/admin/news/route.ts`) yaratildi.
- [x] **1) To'liq Ko'p Tillilik (i18n)**:
  - 3 ta til to'liq kiritildi: O'zbekcha (`uz`), Русский (`ru`), English (`en`).
  - `src/messages/{en,uz,ru}.json` fayllari yaratildi (252 ta kalit, 100% paritet).
  - Cookie `locale` asosida prefikssiz yo'naltirish, `I18nProvider` va `useI18n()` reaktiv hook yaratildi.
  - Header, Footer, Hero, Row sarlavhalari, filtrlar, player, sharhlar, auth, profil, settings to'liq tarjima qilindi.
- [x] **2) Haqiqiy Auth & Xavfsizlik**:
  - **Register**: 6 xonali tasdiqlash kodi bilan verifikatsiya (10 daqiqa amal qilish, bcrypt hesh, 5 ta urinishdan so'ng bloklash, 60s cooldown).
  - **Login**: Email yoki Username + Parol, "Remember me" (30 kunlik sessiya).
  - **Forgot/Reset**: 6 xonali kod yoki bir martalik havola bilan parolni tiklash va barcha eski sessiyalarni bekor qilish.
  - **OAuth**: Google (majburiy), GitHub va Discord tugmalari (`OAuthButtons`), hisoblarni avtomatik xavfsiz bog'lash (account linking).
  - **Settings > Account**: Email o'zgartirish (kod bilan), parol almashtirish (eski parol tekshiriladi), ulangan akkauntlarni boshqarish (unlink), faol sessiyalar ro'yxati va boshqa qurilmalardan chiqish.
  - **Seed**: Test foydalanuvchilari faqat dev rejimda, production'da admin `ADMIN_EMAIL` va `ADMIN_PASSWORD` orqali yaratiladi.
- [x] **3) Email Tizimi (Nodemailer)**:
  - `src/lib/email.ts` yaratildi (SMTP transport + development terminal log fallback).
  - Orven Media qora minimalist dizaynidagi HTML/plain-text shablonlar (verify, reset, change email, welcome) 3 tilda tayyorlandi.
  - `.env.example` va `.env.production.example` to'liq yangilandi.
- [x] **4) Saytni Chuqurlashtirish**:
  - Watch sahifasida ochiq litsenziyali Blender Foundation video oqimlari (Big Buck Bunny, Sintel, Tears of Steel) fallback sifatida kiritildi.
  - `/api/health` tizim holati monitoring endpointi qo'shildi.
  - Xavfsizlik headerlari (`Strict-Transport-Security`, `CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) kiritildi.
- [x] **5) Production & Legal Sahifalar**:
  - `docker-compose.yml` yangilandi (SMTP va OAuth parametrlar bilan).
  - `README.md` to'liq qayta yozildi (arxitektura, xususiyatlar, API, Upwork / portfolio tavsifi, VPS/Docker va Vercel/Neon yo'riqnomalari).
  - Legal sahifalar (`Terms`, `Privacy`, `DMCA`) professional huquqiy matnlar va demo disclaimer bilan to'ldirildi.
- [x] **6) Yakuniy Sinov**:
  - `npx tsc --noEmit` muvaffaqiyatli (0 ta xatolik).
  - Barcha dictionary kalitlari (252/252) sinovdan o'tdi.
  - Vaqtinchalik sinov skriptlari o'chirildi.

---

### 13-bosqich: Ro'yxatdan O'tish (Register / OTP) Oqimini Mukammallashtirish [YAKUNLANGAN]
- [x] **Muammo Ildizi Aniqlanishi**: Foydalanuvchi ro'yxatdan o'tishda username va email kiritganda, `register/route.ts` darhol `User` jadvaliga `emailVerified: null` bilan yozuv kiritgan. Agar foydalanuvchi OTP kiritmay sahifani yangilasa, ortga qaytsa yoki emailni xato kiritib boshqa email bilan qayta urinsa, avvalgi tasdiqlanmagan yozuv unikal `username` cheklovi tufayli "Username is already taken" xatosini berib foydalanuvchini bloklab qo'ygan.
- [x] **Unikal Tekshiruv Faqat Tasdiqlangan (Verified) Akkauntlar Uchun**:
  - `src/app/api/auth/register/route.ts`: Dublikat `email` va `username` tekshiruvi faqat `emailVerified !== null` yoki himoyalangan (`ADMIN`, `MODERATOR`) akkauntlar uchun 409 xatosini qaytaradi.
  - Avvalgi tasdiqlanmagan (`emailVerified: null`, `role: 'USER'`) urinishlar yangi urinishda to'qnash kelganda, ularning eski tokenlari va tasdiqlanmagan vaqtinchalik yozuvlari avtomatik ravishda xavfsiz tozalanadi va yangi ro'yxatdan o'tishga to'sqinlik qilmaydi.
- [x] **Ortga Qaytishda Username Darhol Bo'shatilishi**:
  - `src/app/api/auth/register/cancel/route.ts` API yaratildi.
  - `RegisterPage` (`src/app/(auth)/auth/register/page.tsx`): OTP bosqichida "Ortga" (`Back`) tugmasi bosilganda fon rejimida cancel API chaqiriladi va tasdiqlanmagan vaqtinchalik yozuv bazadan darhol o'chirilib, username va email soniyada bo'shaydi.
- [x] **Email Jo'natish Xatolarini Aniq Qaytarish**:
  - `src/app/api/auth/register/route.ts` va `src/app/api/auth/verify/resend/route.ts`: `sendVerificationEmail` natijasi tekshiriladi (`mailResult.success`). Agar SMTP yoki email yuborishda xatolik yuz bersa, u konsolga aniq log qilinadi, yaratilgan yozuv darhol rollback (tozalanadi) qilinadi va foydalanuvchiga tushunarli 500 statusli xato xabari qaytariladi.
- [x] **Auth Kirish (Login) Xavfsizligi**:
  - `src/lib/auth.ts`: Credentials provider'da `emailVerified` tekshiruvi qo'shildi — tasdiqlanmagan foydalanuvchi to'g'ridan-to'g'ri tizimga kira olmaydi (`Please verify your email address before logging in`).
  - `src/app/(auth)/auth/login/page.tsx`: Tasdiqlanmagan akkaunt uchun maxsus xabar ko'rsatiladi.
  - `en.json`, `uz.json`, `ru.json` da `auth.email_not_verified` tarjimalari qo'shildi.
- [x] **To'liq Integratsion Test**:
  - Dasturiy test orqali (1) dastlabki tasdiqlanmagan urinish, (2) bir xil username bilan boshqa email orqali qayta urinish (eski username avtomatik bo'shashi), (3) ortga qaytish / cancel qilish, (4) yangi email bilan OTP olish, (5) xato va to'g'ri kod bilan tasdiqlash, (6) tasdiqlangandan so'ng dublikat username va email to'liq bloklanishi 100% muvaffaqiyatli sinovdan o'tkazildi.
- [x] **Yakuniy Tekshiruv**:
  - `npx tsc --noEmit` muvaffaqiyatli o'tdi (0 xato).
  - Vaqtinchalik test fayli o'chirildi.
