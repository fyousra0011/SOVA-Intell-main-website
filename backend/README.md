# SOVA Intelligence backend

Small Express API for the public website RSVP form. RSVP records are stored in SQLite using prepared statements, and optional SMTP notifications are sent through Nodemailer. The service is intentionally stateless at the HTTP layer: it does not use browser cookies or sessions, so traditional CSRF tokens are not required for this public endpoint. If authentication or cookie sessions are added later, add CSRF protection at the same time.

## Local setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

The API listens on `http://localhost:5000` by default. The frontend expects this URL unless `VITE_API_BASE_URL` is set.

## Commands

```powershell
npm run build
npm test
npm start
```

`npm audit` should be run before deployment. The current SQLite adapter is suitable for local development and a single normal Node deployment with persistent disk. It is not suitable for serverless/ephemeral storage or multiple backend instances. For those deployments, replace the `RsvpRepository` implementation with PostgreSQL while preserving the same interface and RSVP columns.

## Configuration

- `NODE_ENV`: runtime mode; enables HSTS in production.
- `PORT`: HTTP port, default `5000`.
- `FRONTEND_URL`: one or more comma-separated allowed browser origins.
- `DATABASE_URL`: SQLite path locally; a PostgreSQL URL is mandatory in production.
- `TRUST_PROXY`: set to `true` only when one trusted reverse proxy sits in front of the service.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`: SMTP server connection settings.
- `SMTP_USER`, `SMTP_PASSWORD`: SMTP credentials, server-side only; required in production.
- `SMTP_FROM`: optional verified sender address; defaults to `SMTP_USER`.
- `RSVP_NOTIFICATION_EMAILS`: must be exactly `drsalasiah@sovaintell.com`.

When SMTP settings are present, successful RSVP submissions notify both configured recipients. The database write occurs first. If the provider fails, the API returns a safe success response indicating that notification delivery is pending; the RSVP remains stored and is not duplicated. SMTP credentials must be added through deployment secrets. No email is sent when SMTP is intentionally left blank for local development.

## Endpoints

- `GET /api/health`
- `POST /api/rsvp`

The RSVP endpoint accepts `name`, `org`, `title`, `email`, `phone`, `queryType`, `message`, and the hidden `website` honeypot field. It applies server-side validation, normalization, an 8-per-15-minute in-memory IP limit, and a 100 KB JSON limit. Email delivery is tested with a mocked transport; actual delivery requires valid SMTP credentials and a verified sender.

## Deployment

For local SQLite, run `npm run dev`. For PostgreSQL, set `DATABASE_URL` to a connection string from a free-tier provider such as Neon or Supabase, then run `npm run build` and `npm run migrate`. Verify with `SELECT count(*) FROM rsvps;` in the provider SQL console.

Vercel deploys the repository root. Set `NODE_ENV=production`, `DATABASE_URL`, `FRONTEND_URL=https://sovaintell.com`, `TRUST_PROXY=false`, and SMTP variables as encrypted server variables. Run the migration once before enabling the domain. The root `vercel.json` exposes `/api/rsvp` and `/api/health`; the frontend uses same-origin requests by default.
