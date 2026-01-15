# Dashboard Usage

The dashboard is a Vite + React app that reads `/admin/overview` and is served by the worker after building.

## Environment variables

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787 # optional, defaults to worker in dev
VITE_ADMIN_PASSWORD=devpass # optional when BASIC_AUTH_PASSWORD is unset
VITE_APP_ID=app_1 # optional
```

## What it shows

- Active subscribers
- Monthly recurring revenue (from validated receipts)
- Churn events in the last 7 days
- Recent activity stream
- Offerings and products count

The dashboard uses live data from D1/KV. Seed data makes the UI look populated.
