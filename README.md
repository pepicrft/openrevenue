# OpenRevenue 💸

Subscription management backend on Cloudflare Workers. ⚡

Supported SDKs: RevenueCat, Superwall, and custom RevenueCat-style SDKs.

Note: Adapty SDKs cannot be pointed at a custom backend because base URL configuration is not publicly exposed.

> [!WARNING]
> Work in progress. Get involved by opening issues or PRs.

## Deploy 🚀

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pepicrft/openrevenue)

```bash
pnpm install
pnpm -C packages/worker wrangler d1 create openrevenue
pnpm -C packages/worker wrangler -c ../../wrangler.toml d1 migrations apply openrevenue
pnpm build
```

Update `wrangler.toml` with the D1 database id.
Replace the KV namespace `id` and `preview_id` placeholders with real values.
Replace the placeholder D1 `database_id` before deploying.

```bash
pnpm -C packages/worker wrangler d1 execute openrevenue --command "INSERT INTO apps (id, name, api_key, created_at) VALUES ('app_1', 'Default', 'rc_test_3f64a1b2', datetime('now'))"
pnpm deploy
```

### Local seed data

```bash
pnpm db:migrate
pnpm db:seed
```

Start the worker + dashboard (HMR) with required store credentials:

```bash
APPLE_SHARED_SECRET=your_secret pnpm dev
# or
GOOGLE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)" pnpm dev
```

## Endpoints ✅

Core SDK endpoints:

- `GET /v1/health`
- `POST /v1/receipts`
- `GET /v1/subscribers/:app_user_id`
- `POST /v1/subscribers/:app_user_id/attributes`
- `GET /v1/subscribers/:app_user_id/offerings`
- `POST /v1/subscribers/identify`

See `docs/api.md` for the full list, including admin endpoints.

Auth header: `Authorization: Bearer <api_key>` or `X-API-Key: <api_key>`.

Admin (Basic auth if `BASIC_AUTH_PASSWORD` is set):

- `GET /admin/health`
- `GET /admin/apps`
- `POST /admin/apps`
- `POST /admin/apps/:id/keys`
- `POST /admin/apps/:id/keys/:key_id/revoke`
- `GET /admin/overview`

## Dashboard 🎛️

The dashboard is served by the worker after building the frontend assets.

```bash
pnpm dev
```

## Docs 📚

See `docs/INDEX.md`.

## Next 🧭

See `PLAN.md`.
