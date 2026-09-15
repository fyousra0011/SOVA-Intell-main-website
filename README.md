# SOVA Intelligence website

The repository contains a React/Vite frontend and a shared Express/TypeScript RSVP API deployed as Vercel serverless functions.

## Architecture

- `frontend/`: React/Vite website built into the root Vercel deployment.
- `backend/`: API with Helmet, restricted CORS, rate limiting, Zod validation, PostgreSQL production persistence, SQLite local persistence, and SMTP notifications.
- `api/`: Vercel function entry points for `/api/rsvp` and `/api/health`.

The current backend is stateless and does not use authentication cookies. The SQLite repository is appropriate for local development and a single Node instance with persistent disk. `backend/migrations/001_create_rsvps.sql` defines the equivalent PostgreSQL table; implement the PostgreSQL repository behind the same `RsvpRepository` interface before using ephemeral storage or multiple backend instances.

## Local development

Backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend, in another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend calls same-origin `/api` routes by default. Set `VITE_API_BASE_URL` only for a separate local backend URL; never put SMTP, database, or other secrets in Vite variables.

## Environment

Backend variables are documented in `backend/.env.example`. SMTP variables are optional locally but required in production for notifications. The only notification recipient is `drsalasiah@sovaintell.com`; production configuration rejects other recipients.

Frontend uses `VITE_API_BASE_URL` from `frontend/.env.example`. `VITE_LINKEDIN_URL` and `VITE_INSTAGRAM_URL` are optional public URLs; blank values intentionally hide the icons rather than render broken links.

## API

```text
GET  /api/health
POST /api/rsvp
```

The RSVP endpoint validates and stores the existing form fields: `name`, `org`, `title`, `email`, `phone`, `queryType`, and `message`. It also accepts the hidden `website` honeypot field.

## Verification

```powershell
cd backend
npm run build
npm test
npm audit --audit-level=high

cd ../frontend
npm run build
```

The frontend does not currently have a test runner. TypeScript/editor diagnostics should be checked in VS Code as part of the final review.

## Deployment

Deploy the repository root to one Vercel project with these exact settings:

- Root Directory: repository root (`/`)
- Build Command: `npm --prefix frontend run build`
- Output Directory: `frontend/dist`
- Install Command: `npm --prefix backend install && npm --prefix frontend install`

Set `NODE_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `TRUST_PROXY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `RSVP_NOTIFICATION_EMAILS` in Vercel. Use a free-tier PostgreSQL provider such as Neon or Supabase, copy its `DATABASE_URL`, and run `cd backend; npm run build; npm run migrate` once. No external backend host is required.

The root `vercel.json` is authoritative. Its SPA rewrite explicitly excludes `/api/*`, so `GET /api/health` and `POST /api/rsvp` reach `api/health.ts` and `api/rsvp.ts` respectively. The frontend uses same-origin `/api` requests in production; `VITE_API_BASE_URL` is only needed for local development against a separate backend.

Google Workspace: use an app password for `drsalasiah@sovaintell.com` when 2-Step Verification is enabled, or the Workspace-approved SMTP/OAuth method. Store the secret only in Vercel `SMTP_PASSWORD`; use `smtp.gmail.com`, port `587`, `SMTP_SECURE=false`, `SMTP_USER=drsalasiah@sovaintell.com`, and `SMTP_FROM=drsalasiah@sovaintell.com`. Real SMTP delivery requires these credentials and was not exercised in automated tests.

Squarespace DNS: point the apex domain to the Vercel project using the records Vercel displays, and add `www` as a CNAME to the Vercel target if needed. Configure this manually in Squarespace; the repository makes no DNS changes. Verify the domain in Vercel before using `https://sovaintell.com/api/rsvp`.