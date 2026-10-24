# Abpure

React 18 + Vite + Tailwind frontend, Express + PostgreSQL (Neon) backend.

## Run locally
1. `npm install`
2. `cp .env.example .env` and fill in `DATABASE_URL`, `JWT_SECRET`, admin credentials and `PAYMENT_NUMBERS`
3. `npm run seed` (applies `server/schema.sql` and creates the admin user)
4. `npm run dev:all` → web on http://localhost:5173, API on http://localhost:5000

## Deploy (Render)
Push to GitHub, create a Blueprint from `render.yaml`, then fill in the env vars marked `sync: false`.
Health check: `/api/health`. In production, Express serves `dist/` and the API from one process.
