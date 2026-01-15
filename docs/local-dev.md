# Local Development & Seeding

## Run locally

```bash
pnpm dev
```

Set store credentials, at least one of:

- `APPLE_SHARED_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

## Apply migrations

```bash
pnpm db:migrate
```

## Seed data

```bash
pnpm db:seed
```

KV persistence is provided by `wrangler dev --local --persist`.
