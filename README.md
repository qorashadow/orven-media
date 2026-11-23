# ORVEN MEDIA 🎬
### Ultra HD Anime & Donghua Streaming Platform

> **Live Portfolio Showcase**: A production-grade, full-stack video streaming application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **Auth.js**. Features cinematic dark minimalism (`#0b0b0d`), custom HTML5/HLS video player, 3-language internationalization (`en`, `uz`, `ru`), email verification security, and a comprehensive administrative suite.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/Auth.js-NextAuth_v5-purple?style=flat-square)](https://authjs.dev/)

---

## 📸 Screenshots & Showcase

| Homepage Spotlight Slider | Custom HLS / MP4 Video Player |
| :---: | :---: |
| *(Hero Spotlight with dynamic carousel & backdrop vignette)* | *(Speed, multi-track subtitles, skip intro & theater mode)* |

| Multi-Language Support (UZ, RU, EN) | Comprehensive Admin Panel |
| :---: | :---: |
| *(Seamless cookie-based reactive locale switcher)* | *(AniList GraphQL importer, episode CRUD & audit logs)* |

---

## ✨ Key Architectural Features

### 1. 🎨 Cinematic Sharp Minimalist Design
- **Color Discipline**: Deep void background (`#0b0b0d`), structural layers (`#111114`, `#17171b`), and hairline borders (`#26262c`). Cool steel accent (`#a0a0b0`). No distracting neon gradients.
- **Sharp Geometry**: 0-2px border radii, precision grid, and clipped corners (`clip-corner-tr`).
- **Kinematic Touches**: Micro-parallax hero slider, subtle analog film grain overlay, skeleton loading states, and custom thin scrollbars respecting `prefers-reduced-motion`.
- **Typography**: Space Grotesk (headings), Inter (body readability), JetBrains Mono (metadata & timecodes).

### 2. 🌐 Multi-Language Localization (i18n)
- **Supported Languages**: English (`en`), O'zbek (`uz`), and Русский (`ru`).
- **Zero URL Pollution**: Prefix-less routing managed via fast, secure cookie detection and browser fallback.
- **Full Coverage**: 100% of UI elements localized (Header, Footer, Hero, Rows, Player, Auth, Modals, Forms, Profile, Settings, and Admin).
- **Client & Server Integration**: Reactive `useI18n()` hook for client components and `getServerTranslations()` for SSR.

### 3. 🎥 High-Fidelity Video Player
- **Adaptive Bitrate & Direct Streaming**: Native HLS.js streaming (`.m3u8`) and direct MP4 playback.
- **Smart Playback**: One-click **Skip Intro (+85s)**, auto-play, auto-next episode, and theater / lights-off modes.
- **Audio & Subtitles**: Multi-language `.vtt` subtitle track switcher with styling options.
- **Persistent State**: Progress synchronized to millisecond accuracy with DB for logged-in users; resumes seamlessly.
- **Keyboard Shortcuts**: `Space`/`k` (play/pause), `f` (fullscreen), `m` (mute), `j`/`l` (±10s seek), `ArrowLeft`/`ArrowRight` (±5s seek), `t` (theater mode), `i` (PiP).

### 4. 🛡️ Robust Authentication & Security
- **Email Verification Codes**: 6-digit confirmation codes (10-minute expiry, bcrypt-hashed in DB, 5-attempt rate-limit lockout, 60-second resend cooldown).
- **Credentials & OAuth**: Email/username + bcrypt password; Google OAuth; GitHub and Discord connectors with automatic account linking.
- **Account Control**: In-app email change verification, password updating with strength meter, session list management with "Sign out other devices", and account deletion.
- **Security Headers**: HSTS, CSP, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`).

### 5. ⚡ Administrative Suite (`/admin`)
- **AniList GraphQL Importer**: Instant one-click import of anime/donghua metadata, high-res posters, banners, and character mappings.
- **Full CRUD Management**: Anime catalog, episode uploads, video source servers, and multi-language subtitles.
- **Community Moderation**: Comment review, spoiler flagging, user role management (`USER`, `ADMIN`, `MODERATOR`), and account banning.
- **Live Logs & Analytics**: Comprehensive platform audit log and operational analytics dashboard.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16 (React 19, App Router, Server Actions) |
| **Language** | TypeScript (Strict mode, zero `any` leaks) |
| **Styling & Animation** | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Database & ORM** | Prisma ORM (SQLite for zero-config dev, PostgreSQL for production) |
| **Authentication** | Auth.js / NextAuth v5 (JWT sessions, bcryptjs, OAuth) |
| **Video Engine** | HLS.js + Custom HTML5 Video Player |
| **Email Gateway** | Nodemailer with SMTP & Development Console Log Fallback |
| **Validation** | Zod v4 schemas |
| **Container & Ops** | Docker (multi-stage), Docker Compose, Nginx Reverse Proxy, FFmpeg |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm** or **pnpm**

### 2. Clone and Install
```bash
git clone https://github.com/your-username/orven-media.git
cd orven-media
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Initialization
```bash
# Push schema to SQLite database (dev.db)
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# Seed 40+ anime, 15+ donghua, genres, and sample users
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Default Demo Credentials:
- **Admin**: `admin@orven.media` / `Admin123!`
- **User**: `user@orven.media` / `User123!`

*(Note: In development without SMTP configured, 6-digit confirmation codes are printed directly to the terminal console).*

---

## 📋 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `file:./dev.db` | Connection string for SQLite or PostgreSQL |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical app URL for authentication callbacks |
| `NEXTAUTH_SECRET` | **Yes** | - | 32+ character random secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Optional | - | Google Cloud OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | - | Google Cloud OAuth Client Secret |
| `GITHUB_CLIENT_ID` | Optional | - | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | Optional | - | GitHub OAuth Client Secret |
| `DISCORD_CLIENT_ID` | Optional | - | Discord Developer Portal Application ID |
| `DISCORD_CLIENT_SECRET` | Optional | - | Discord Developer Portal Secret |
| `SMTP_HOST` | Optional | - | SMTP Server Hostname (e.g. `smtp.resend.com`) |
| `SMTP_PORT` | Optional | `587` | SMTP Port (`465` for SSL, `587` for TLS) |
| `SMTP_USER` | Optional | - | SMTP Username or API key |
| `SMTP_PASS` | Optional | - | SMTP Password or API secret |
| `EMAIL_FROM` | Optional | `Orven Media <noreply@...>` | Sender address for transactional emails |
| `ADMIN_EMAIL` | Optional | `admin@orven.media` | Production seed admin account email |
| `ADMIN_PASSWORD` | Optional | - | Production seed admin password |
| `NEXT_PUBLIC_APP_URL` | Optional | `http://localhost:3000` | Publicly accessible domain for metadata & links |

---

## 🐳 Production Deployment Guide (VPS + Docker + Nginx + SSL)

### Architecture
```
[User Browser]
       │
       ▼ (Port 80/443 HTTPS)
┌──────────────┐
│ Nginx Proxy  │  (SSL Termination & Static Assets Cache)
└──────┬───────┘
       │
       ▼ (Port 3000)
┌──────────────┐       ┌──────────────┐
│ Next.js App  ├──────►│  PostgreSQL  │ (Port 5432)
└──────────────┘       └──────────────┘
```

### Steps:
1. **Clone repository onto VPS**:
   ```bash
   git clone https://github.com/your-username/orven-media.git /var/www/orven-media
   cd /var/www/orven-media
   ```

2. **Configure Production Environment**:
   ```bash
   cp .env.production.example .env
   # Edit with production credentials and domain
   nano .env
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

4. **Run Database Migrations & Seed Inside Container**:
   ```bash
   docker compose exec app npx prisma db push
   docker compose exec app npm run prisma:seed
   ```

5. **Configure Let's Encrypt SSL**:
   ```bash
   sudo certbot --nginx -d orven.media -d www.orven.media
   ```

---

## ☁️ Serverless Deployment (Vercel + Neon PostgreSQL)

1. **Database**: Create a serverless PostgreSQL database on [Neon.tech](https://neon.tech) and copy the connection string.
2. **Push Repository**: Push code to GitHub.
3. **Import to Vercel**: Connect repository to Vercel.
4. **Environment Variables**: Add `DATABASE_URL` (Neon pooling URL), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optional SMTP/OAuth keys.
5. **Build Command**: Set build command to:
   ```bash
   npx prisma generate && npm run build
   ```

---

## ⚖️ Legal & Fair Use Notice

**Orven Media** is designed as a non-commercial software demonstration and technical portfolio showcase. 
- All video streams showcased in demo mode are Creative Commons licensed works created and published by the **Blender Foundation** (*Big Buck Bunny*, *Sintel*, *Tears of Steel*).
- Series metadata, synopsis texts, and cover artwork are accessed via the public **AniList GraphQL API** for demonstration purposes under fair use.
- The platform does not host, distribute, or monetize unauthorized copyrighted files.

---

## 📄 License
Source code is released under the **MIT License**.

© 2026 **Orven Media**. Built by senior full-stack engineering standards.
