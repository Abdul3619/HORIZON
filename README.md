# L'Horizon Royal

I built this luxury resort website (English / French) for L'Horizon Royal. It has the suites, a booking flow and a staff dashboard.

## What is live vs. demo

- **Public site** (`/`, `/rooms`, `/booking`): the booking flow runs entirely in the browser. **No payment is taken and no email is sent**; the checkout says so. Suites and prices are in `src/HotelContext.tsx`.
- **Staff Portal** (`/admin`): a front-end demo with sample data (role switcher, rooms, bookings, analytics, settings). Changes are kept in memory only and are not shown on the public pages. There is no login.
- **Backend scaffolding** (not deployed on Vercel): `server.ts` (Express: Stripe checkout + webhook), `packages/` (Supabase client, Stripe adapter, notifications), `packages/db/migrations/` (Postgres schema) and `apps/web/` (Next.js-style route handlers, not wired into this app). Connecting a real Supabase project, admin authentication and Stripe is required before bookings can be stored or paid.

## Stack

React 19, Vite, Tailwind CSS 4, Motion, Recharts. Public views are prerendered at build time (`src/entry-server.tsx` + `scripts/prerender.mjs` → `dist/index.html`, `dist/rooms.html`, `dist/booking.html`); the browser hydrates them. `/admin` renders client-side.

## Development

```bash
npm install
npm run dev      # Express + Vite on http://localhost:3000
npm run build    # dist/ (static site) + build/server.cjs (Express server)
npm start        # production Express server
npm run lint     # type-check
```

## Deployment

**Vercel (static front end):** Framework: Vite · Build command: `npm run build` · Output directory: `dist`. `vercel.json` enables clean URLs and falls back to the home page. No environment variables are needed for the static site.

**Express server (only if you deploy the backend, e.g. Cloud Run):** `npm run build && npm start`. Environment variables:

| Variable | Used for |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access |
| `STRIPE_SECRET_KEY` | Creating Stripe Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Verifying Stripe webhooks (the webhook refuses requests without it) |

The unused `apps/web` and `packages/notification` code also references `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID` and `REDIS_URL`.
