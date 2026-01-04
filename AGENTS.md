# AGENTS

Guidance for coding agents working in this repo.

## Principles

- Keep changes minimal and focused.
- Prefer TypeScript, Hono, and pnpm.
- Default to Cloudflare-native services (D1 first, KV optional).
- Preserve existing style and file layout.

## Project layout

- `packages/worker`: Cloudflare Worker API (Hono + TypeScript)
- `packages/dashboard`: React dashboard (Vite + Tailwind, shadcn-style components)
- `packages/marketing`: Marketing website
- `examples/`: iOS and Android example apps with RevenueCat SDK

## Local commands

```bash
mise install
pnpm install
pnpm -C packages/worker dev
pnpm -C packages/dashboard dev
```

## Database

### Migrations

Database schema lives in `packages/worker/migrations/`. Migrations are numbered SQL files:
- `0001_init.sql` - Core tables (apps, users, subscriptions, entitlements)
- `0002_dashboard_auth.sql` - Dashboard authentication tables

Apply migrations:
```bash
pnpm -C packages/worker db:migrate
```

### Seed Data

**IMPORTANT:** The seed script (`packages/worker/scripts/seed.sql`) must be kept up to date:
- When adding new tables, add relevant seed data
- Ensure seed data is realistic and covers common use cases
- Include edge cases (expired subscriptions, unverified users, etc.)
- Document test credentials/tokens in the seed file comments

Run seed:
```bash
pnpm -C packages/worker db:seed
```

Reset database (migrate + seed):
```bash
pnpm -C packages/worker db:reset
```

### Schema (Drizzle ORM)

TypeScript schema definitions are in `packages/worker/src/db/schema.ts`. Keep this in sync with migrations.

## Conventions

- API endpoints live under `/v1` and must include API key auth.
- Admin endpoints live under `/admin` and require Basic auth if configured.
- Auth endpoints live under `/auth` for dashboard authentication.
- Add new endpoints to the README and update `PLAN.md`.
- Do not mock global JS runtime variables in tests. Dependency-inject them into the subject or helpers under test.
- Marketing content is localized. Any copy changes in the marketing page must be mirrored across all locales.

## Authentication

Dashboard uses magic link (email) authentication:
- `POST /auth/login` - Request verification email
- `POST /auth/verify` - Verify token and create session
- `GET /auth/me` - Get current user
- `POST /auth/logout` - End session
- `GET /auth/dev/pending` - (Dev only) List pending tokens

In development (no EMAIL binding), tokens are returned directly for easy testing.

## Tests

- No automated tests yet. If you add tests, document how to run them.
