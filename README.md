# DealSchool — VC Fellowship Platform

DealSchool is a full-stack web application for a 10-week, cohort-based venture capital fellowship by Middha Ventures. Applicants discover the programme, apply online, and pay the fellowship fee. Admins review applications, manage statuses, and trigger Cashfree payment links — all from a password-protected dashboard.

---

## Architecture

The frontend is an npm-workspaces monorepo with two independently deployed Vite apps, plus a separate backend repo:

| Package | Stack | Port | Purpose |
|------|-------|------|---------|
| **apps/website** (this repo) | Vite + React 19 + TypeScript + Tailwind v4 | `3000` | Public marketing site + application form, deployed to `dealschool.in` |
| **apps/admin** (this repo) | Vite + React 19 + TypeScript + Tailwind v4 | `3001` | Admin dashboard, deployed separately to `admin.dealschool.in` |
| **packages/shared** (this repo) | TypeScript | — | Firebase Auth init, shared types, and the backend API URL — imported by both apps via the `@shared/*` alias |
| **dealschool_backend** | Next.js 15 (App Router) + Firebase Admin SDK | `3001` | REST API, Firestore writes, email delivery, Cashfree integration |

Splitting the admin dashboard into its own app means public visitors never download admin code, and the admin origin can be locked down independently (separate hosting rules, IP allowlisting, etc.) from the marketing site.

**Firebase** is used for:
- **Auth** — admin login via email/password and Google OAuth (client-side, in the frontend only)
- **Firestore** — stores `applications`, `contacts`, `payments`, `rateLimits` (all reads/writes go through the backend Admin SDK; the frontend never touches Firestore directly)

Firestore security rules deny all direct client access — every form submission and data fetch goes through the backend REST API.

---

## Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Authentication enabled
- A Cashfree account (test keys work for local development)
- A Gmail or Google Workspace account for SMTP (with an App Password)
- Firebase CLI: `npm install -g firebase-tools`

---

## 1. Firebase Setup

### 1.1 Create the project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Enable **Firestore Database** (start in production mode)
3. Enable **Authentication** → add **Email/Password** and **Google** sign-in providers
4. Create the admin user manually: `Authentication → Users → Add user` with your admin email (e.g. `admin@dealschool.in`)

### 1.2 Get the web app config (frontend)
`Project Settings → General → Your apps → Web app → SDK setup and configuration`

Copy the config object values — you'll need all of them for the frontend `.env.local`.

### 1.3 Generate a service account key (backend)
`Project Settings → Service accounts → Generate new private key`

Download the JSON file. You'll need `project_id`, `client_email`, and `private_key` for the backend `.env.local`.

### 1.4 Deploy Firestore security rules
From the `dealschool_new` directory:
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

---

## 2. Frontend Setup (this repo)

```bash
git clone https://github.com/your-org/dealschool_new.git
cd dealschool_new
npm install   # installs both apps/website and apps/admin via npm workspaces
```

### Environment variables
Copy the example file and fill in your values. This single `.env.local` lives at the **repo root** and is shared by both apps (each app's `vite.config.ts` points `envDir` at the root):
```bash
cp .env.example .env.local
```

`.env.local`:
```env
# Firebase web SDK credentials (from Project Settings → Your apps)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Admin email — must match the Firebase Auth user created in Step 1.1
VITE_ADMIN_EMAIL=admin@dealschool.in

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Optional — where the admin app's "Back to website" links point.
# Defaults to https://dealschool.in if unset (see packages/shared/config.ts).
# VITE_WEBSITE_URL=http://localhost:3000
```

Note: the public website has no link to the admin app anywhere (by design — the footer's old "[Admin Portal]" link was removed). Admin access is by knowing the `admin.dealschool.in` URL directly.

### Run
```bash
npm run dev:website    # apps/website → http://localhost:3000
npm run dev:admin      # apps/admin   → http://localhost:3001

npm run build          # production build of both apps
npm run build:website  # → apps/website/dist
npm run build:admin    # → apps/admin/dist
npm run lint            # TypeScript type check, both apps
```

---

## 3. Backend Setup (`dealschool_backend`)

```bash
git clone https://github.com/your-org/dealschool_backend.git
cd dealschool_backend
npm install
```

### Environment variables
```bash
cp .env.example .env.local
```

`.env.local`:
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Fellowship fee in rupees (e.g. 1000 = ₹1,000 payment link)
FELLOWSHIP_FEE=1000

# Frontend URL — Razorpay redirects here after payment
APP_BASE_URL=http://localhost:3000

# Email (Gmail with App Password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=admin@dealschool.in

# CORS — comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Firebase web API key (same value as VITE_FIREBASE_API_KEY in frontend)
FIREBASE_WEB_API_KEY=AIza...

# Firebase Admin SDK — from the downloaded service account JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **Note on `FIREBASE_PRIVATE_KEY`:** Paste the key exactly as it appears in the downloaded JSON, with `\n` literals for newlines, wrapped in double quotes.

### Run
```bash
npm run dev                      # starts at http://localhost:3001
npm run build && npm run start   # production
```

---

## 4. Running Both Servers Locally

Open two terminals:

```bash
# Terminal 1 — frontend
cd dealschool_new && npm run dev

# Terminal 2 — backend
cd dealschool_backend && npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. Admin Dashboard

The admin panel is its own app (`apps/admin`), served from its own origin (`admin.dealschool.in` in production, `http://localhost:3001` in dev). Sign in with the Firebase Auth credentials for the admin email you created in Step 1.1. Only that exact email address is authorised — any other account is rejected immediately.

From the dashboard you can:
- View and filter fellowship applications by status
- Move applications through the pipeline: **Pending → Auditing → Interview → Accepted / Declined**
- Accepting an application automatically creates a Cashfree payment link and emails it to the applicant
- View, mark, and archive contact form inquiries
- Resend a payment link if an applicant missed it

---

## 6. Razorpay Webhook (Production Only)

In production, configure Razorpay to send payment events to:

```
https://your-backend-domain.com/api/webhooks/razorpay
```

In the Razorpay dashboard: `Settings → Webhooks → Add new webhook`.  
Events to subscribe to: `payment_link.paid`, `payment_link.cancelled`, `payment_link.expired`.

Set `RAZORPAY_WEBHOOK_SECRET` in your backend environment to the secret generated there.

---

## 7. Deployment

### Frontend — GitHub Actions → VPS
`.github/workflows/deploy.yml` builds both apps on every push to `main` and deploys them to two separate directories on the VPS via SSH/SCP:

| App | Build output | VPS path | Domain |
|-----|--------------|----------|--------|
| Website | `apps/website/dist` | `/var/www/dealschool-frontend` | `dealschool.in` |
| Admin | `apps/admin/dist` | `/var/www/dealschool-admin` | `admin.dealschool.in` |

**One-time manual setup on the VPS (not part of this repo):**
1. Create `/var/www/dealschool-admin` alongside the existing `/var/www/dealschool-frontend`.
2. Add an nginx server block for `admin.dealschool.in` serving that directory (with SPA fallback to `index.html`, same as the existing website vhost).
3. Point `admin.dealschool.in` at the VPS in DNS (A/CNAME record).

### Frontend — Firebase Hosting (alternative)
```bash
npm run build:website
firebase deploy --only hosting
```
`firebase.json` is currently configured for a single site serving `apps/website/dist`. To also host the admin app on Firebase, create a second Firebase Hosting site and target (`firebase hosting:sites:create`, then add a `"target"` entry in `firebase.json` pointing at `apps/admin/dist`).

Update `VITE_BACKEND_URL` to your production value before building.

### Backend — Node.js host (Railway, Render, Fly.io, VPS)
```bash
cd dealschool_backend
npm run build
npm run start
```

Set all `.env.local` variables as environment variables in your hosting dashboard. Update:
- `ALLOWED_ORIGINS` → include your production frontend URL
- `APP_BASE_URL` → your production frontend URL

---

## Project Structure

```
dealschool_new/                    ← this repo (npm workspaces monorepo)
├── package.json                   # root — workspaces + build/dev delegating scripts
├── .env.local                     # shared by both apps (VITE_* vars)
├── packages/
│   └── shared/                    # imported by both apps as "@shared/*"
│       ├── firebase.ts            # Firebase Auth init + helper functions
│       ├── types.ts               # TypeScript interfaces (Application, Contact, Payment)
│       └── config.ts              # VITE_BACKEND_URL / VITE_WEBSITE_URL
├── apps/
│   ├── website/                   # public marketing site → dealschool.in
│   │   ├── src/
│   │   │   ├── App.tsx            # Public pages + client-side routing (SPA)
│   │   │   ├── data.ts            # Static content (founders, curriculum, etc.)
│   │   │   └── components/
│   │   │       ├── HeaderNavbar.tsx
│   │   │       ├── FooterPanel.tsx
│   │   │       ├── ApplyModal.tsx # 5-step application form → POST /api/applications
│   │   │       ├── PaymentCallback.tsx  # Razorpay post-payment landing UI
│   │   │       └── SVGIllustrations.tsx
│   │   └── vite.config.ts
│   └── admin/                     # admin dashboard → admin.dealschool.in
│       ├── src/
│       │   ├── App.tsx            # Login/forgot-password/dashboard switch
│       │   └── components/
│       │       ├── AdminLoginForm.tsx
│       │       ├── AdminForgotPassword.tsx
│       │       ├── AdminDashboard.tsx     # Full admin panel (applications + contacts)
│       │       ├── AdminChangePassword.tsx
│       │       └── CohortSettingsPanel.tsx
│       └── vite.config.ts
├── firestore.rules                # All direct client access denied
├── firebase.json                  # Firebase Hosting + Firestore config
└── .env.example

dealschool_backend/                ← separate repo
└── src/app/api/
    ├── applications/
    │   ├── route.ts               # GET (admin list)  ·  POST (public submit)
    │   ├── [id]/route.ts          # PATCH (update status)  ·  DELETE
    │   └── check/route.ts         # POST (duplicate email/phone check)
    ├── contacts/
    │   ├── route.ts               # GET (admin list)  ·  POST (public submit)
    │   └── [id]/route.ts          # PATCH (update status)  ·  DELETE
    ├── payment/
    │   └── resend/route.ts        # POST (resend payment link to applicant)
    ├── auth/                      # Admin auth helpers (password reset, etc.)
    └── webhooks/razorpay/route.ts # Razorpay payment event handler
```

---

## API Reference

All endpoints are served from `http://localhost:3001`. Public endpoints require no auth header. Admin endpoints require `Authorization: Bearer <firebase-id-token>` from a signed-in admin user.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/contacts` | Public | Submit a contact inquiry |
| `POST` | `/api/applications` | Public | Submit a fellowship application |
| `POST` | `/api/applications/check` | Public | Check for duplicate email or phone |
| `GET` | `/api/applications` | Admin | Paginated list with status counts |
| `PATCH` | `/api/applications/:id` | Admin | Update application status |
| `DELETE` | `/api/applications/:id` | Admin | Delete an application |
| `GET` | `/api/contacts` | Admin | Paginated list with status counts |
| `PATCH` | `/api/contacts/:id` | Admin | Update contact status |
| `DELETE` | `/api/contacts/:id` | Admin | Delete a contact message |
| `POST` | `/api/payment/resend` | Admin | Resend Razorpay payment link |
| `POST` | `/api/webhooks/razorpay` | Razorpay signature | Handle Razorpay payment events |

Rate limiting: public endpoints are rate-limited to 5 requests per 15 minutes per IP (stored in Firestore `rateLimits` collection). Duplicate submissions from the same email within 1 hour return `409`.

---

## Tech Stack

**Frontend**
- React 19, TypeScript, Vite 6
- Tailwind CSS v4
- Motion (Framer Motion v12) for animations
- Lucide React for icons
- Firebase JS SDK v12 (Auth only — no direct Firestore access)

**Backend**
- Next.js 15 with App Router (Node.js runtime)
- Firebase Admin SDK v12 (all Firestore operations)
- Nodemailer for transactional email via Google Workspace SMTP
- Razorpay Node SDK for payment links and webhook verification

**Infrastructure**
- Firebase Firestore (database)
- Firebase Authentication
- Firebase Hosting (frontend CDN)
- Razorpay (payment collection)
