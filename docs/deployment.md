# Deployment (Cloudflare)

## Prereqs

- Cloudflare account with Workers + D1 enabled
- Wrangler installed via `pnpm`

## Deploy worker

```bash
pnpm -C packages/worker wrangler d1 create openrevenue
pnpm -C packages/worker wrangler -c ../../wrangler.toml d1 migrations apply openrevenue
pnpm build
pnpm -C packages/worker deploy
```

Update `wrangler.toml` with your D1 database id and KV namespace id/preview_id.
Replace the placeholder D1 `database_id` before deploying.

## Required env vars

- `APPLE_SHARED_SECRET` or `GOOGLE_SERVICE_ACCOUNT_JSON`
- `BASIC_AUTH_PASSWORD` to protect admin endpoints

## Dashboard

The dashboard is bundled as static assets and served by the worker.
