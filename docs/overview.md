# Overview & Architecture

OpenRevenue is a subscription management backend built for Cloudflare Workers. It provides a RevenueCat-style API surface that can be reused by other subscription SDKs with similar receipt, entitlement, and subscriber semantics.

## Goals

- Edge-first API with low latency.
- D1 for source of truth, KV for hot cache.
- Minimal surface area: receipts, subscribers, offerings, products, webhooks, admin.
- Compatible with multiple SDKs that follow RevenueCat-like flows.

## SDK compatibility scope

OpenRevenue aligns with the RevenueCat iOS HTTP contract for core subscription flows and is usable by other SDKs with similar shapes (as long as they allow backend base URL overrides). The following SDK endpoints are implemented today:

- `GET /v1/health`
- `POST /v1/receipts`
- `GET /v1/subscribers/:app_user_id`
- `POST /v1/subscribers/:app_user_id/attributes`
- `POST /v1/subscribers/identify`
- `GET /v1/subscribers/:id/offerings`
- `POST /v1/subscribers/:id/intro_eligibility`
- `POST /v1/subscribers/:id/attribution`
- `POST /v1/subscribers/:id/adservices_attribution`
- `GET /v1/subscribers/:id/health_report`
- `GET /v1/subscribers/:id/health_report_availability`
- `POST /v1/offers`
- `POST /v1/subscribers/redeem_purchase`
- `GET /v1/subscribers/:id/virtual_currencies`
- `GET /v1/product_entitlement_mapping`
- `GET /v1/customercenter/:id`
- `POST /v1/customercenter/support/create-ticket`

## High-level flow

1. Client SDK posts receipts to `/v1/receipts`.
2. Worker validates the receipt with Apple/Google.
3. Subscriptions and entitlements are persisted in D1.
4. Customer info is cached in KV for fast subscriber lookups.
5. Webhooks can update subscription state asynchronously.

## Data model (D1)

- `apps`: application registry.
- `app_keys`: API keys (multiple per app).
- `users`: app user profiles.
- `products`: product catalog.
- `offerings`: groupings of products.
- `offering_products`: join table.
- `subscriptions`: validated purchases.
- `entitlements`: effective access state.
- `receipts`: receipt validation history.
- `events`: analytics/event stream.
- `webhook_events`: raw webhook payloads.

## Caching

- KV key: `customer:{appId}:{appUserId}`
- TTL: 300s
- Cache is filled on receipt validation or subscriber fetch.

## API surfaces

- `/v1/*`: SDK-facing endpoints, API key required.
- `/admin/*`: admin endpoints, Basic auth required.
