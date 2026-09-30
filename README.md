# University Department CMS

A full-stack **University Department Content Management System** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB/Mongoose**, and **ImageKit**.

The public website and admin dashboard are driven entirely by **Site Settings** and content APIs — university and department names are **never hardcoded** in the UI. A Super Admin can rebrand the entire site for any institution.

---

## Features

### Public site
- Home (hero, intro, HOD message, stats, notices, achievements, featured faculty, quick links)
- About (history, vision, mission, objectives)
- Faculty directory + profile pages
- Achievements (filter by year / category / search)
- Gallery albums + lightbox
- Notices (important + latest, PDF links, expiry-aware)
- Resources (external Notes Portal + Question Paper Repository links only — **no note storage**)
- Contact page + form

### Admin dashboard
- Cookie-based JWT auth
- CRUD for Faculty, Achievements, Gallery, Notices
- Image upload via ImageKit only (`/api/admin/upload`)
- **Super Admin only:** Site Settings, Users, Activity Logs

---

## Tech stack

| Layer | Tech |
|--------|------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Icons | React Icons |
| Theming | next-themes (class strategy) |
| Toasts | react-hot-toast |
| Database | MongoDB + Mongoose |
| Auth | JWT in HTTP-only cookie |
| Media | ImageKit only |

---

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- ImageKit account (**required** for image uploads)

### 2. Install dependencies

```bash
cd "Department management system"
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret (32+ chars) |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/vvt2npcxp` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:5000` |
| `SEED_SUPER_ADMIN_EMAIL` | Optional seed email |
| `SEED_SUPER_ADMIN_PASSWORD` | Optional seed password |
| `SEED_ADMIN_EMAIL` | Optional seed email |
| `SEED_ADMIN_PASSWORD` | Optional seed password |

### 4. Seed sample data

```bash
npm run seed
```

This upserts Site Settings, creates admin users (if missing), and seeds faculty, achievements, gallery, and notices.

### 5. Run the app

```bash
npm run dev
```

Open **[http://localhost:5000](http://localhost:5000)**.

Production:

```bash
npm run build
npm start
```

---

## Seed credentials

Defaults (override via `.env.local`):

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `superadmin@university.edu` | `SuperAdmin@123` |
| **Admin** | `admin@university.edu` | `Admin@123` |

Admin login: [http://localhost:5000/admin/login](http://localhost:5000/admin/login)

---

## Roles

### Super Admin (`super_admin`)
- Full access to all admin CRUD
- **Site Settings** — rebrand university/department names, logos, hero, contact, portals, about content, social links, stats
- **Users** — create / enable / disable department admins
- **Activity Logs** — audit trail

### Admin (`admin`)
- Manage Faculty, Achievements, Gallery, Notices
- **Cannot** access Settings, Users, or Logs (middleware enforces this)

---

## How to rebrand for any university

1. Sign in as **Super Admin**
2. Go to **Admin → Settings**
3. Update:
   - University name & logo
   - Department name & logo
   - Hero title / subtitle / image
   - Welcome & HOD message
   - About (history, vision, mission, objectives)
   - Contact details & map embed
   - Social links
   - Notes Portal URL & Question Paper Repository URL
   - Homepage stats
4. Save — the public navbar, footer, and pages load branding from `GET /api/settings`

No code changes are required to deploy for a different department.

---

## Project structure (frontend)

```
src/
  app/
    (public)/          # Public pages (Home, About, Faculty, …)
    admin/             # Admin dashboard
    api/               # Backend API routes
  components/
    layout/            # Navbar, Footer, ThemeToggle
    ui/                # Button, Card, Modal, …
    admin/             # Admin sidebar, image upload
  hooks/useSettings.ts
  lib/fetchers.ts
  types/index.ts
```

---

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **5000** |
| `npm run build` | Production build |
| `npm start` | Start production server on port **5000** |
| `npm run seed` | Seed database |
| `npm run lint` | ESLint |

---

## Notes

- Auth cookie is set by `POST /api/auth/login` and sent with `credentials: "include"`.
- Resources page only shows **external links** from settings — it does not store notes or PDFs.
- Empty states are shown gracefully when APIs return no data.
- Dark mode uses `next-themes` with Tailwind `darkMode: "class"`.
