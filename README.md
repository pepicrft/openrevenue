# OpenRevenue 💸

RevenueCat-compatible backend on Cloudflare Workers. ⚡

> [!WARNING]
> Work in progress. Get involved by opening issues or PRs.

## Deploy 🚀

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pepicrft/openrevenue)

```bash
pnpm install
pnpm -C packages/worker wrangler d1 create openrevenue
pnpm -C packages/worker wrangler d1 migrations apply openrevenue
```

Update `wrangler.toml` with the D1 database id.

```bash
pnpm -C packages/worker wrangler d1 execute openrevenue --command "INSERT INTO apps (id, name, api_key, created_at) VALUES ('app_1', 'Default', 'rc_test_3f64a1b2', datetime('now'))"
pnpm deploy
```

## Endpoints ✅

- `GET /v1/health`
- `POST /v1/receipts`
- `GET /v1/subscribers/:app_user_id`
- `POST /v1/subscribers/:app_user_id/attributes`

Auth header: `Authorization: Bearer <api_key>` or `X-API-Key: <api_key>`.

Admin (Basic auth if `BASIC_AUTH_PASSWORD` is set): `GET /admin/health`.

## Dashboard 🎛️

```bash
pnpm -C packages/dashboard dev
```

## Next 🧭

See `PLAN.md`.
