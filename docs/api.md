# API Reference

Base URL: your Cloudflare Worker URL.

All `/v1` endpoints require:

- `Authorization: Bearer <api_key>` or
- `X-API-Key: <api_key>`

## v1

### `GET /v1/health`

Returns `{ status: "ok" }`.

### `POST /v1/receipts`

Validate a purchase.

Request body (App Store):

```json
{
  "app_user_id": "user_123",
  "product_id": "pro_monthly",
  "store": "app_store",
  "transaction_id": "...",
  "purchase_date_ms": 1710000000000,
  "receipt_data": "<base64>"
}
```

Play Store variant:

```json
{
  "app_user_id": "user_123",
  "product_id": "pro_monthly",
  "store": "play_store",
  "purchase_token": "...",
  "package_name": "com.example.app",
  "price_cents": 1299,
  "currency": "USD"
}
```

Response (trimmed):

```json
{
  "request_date": "2024-09-01T10:00:00.000Z",
  "request_date_ms": 1725184800000,
  "subscriber": {
    "original_app_user_id": "user_123",
    "first_seen": "2024-08-01T10:00:00.000Z",
    "last_seen": "2024-09-01T10:00:00.000Z",
    "entitlements": {
      "pro_monthly": {
        "product_identifier": "pro_monthly",
        "expires_date": "2024-10-01T10:00:00.000Z",
        "ownership_type": "PURCHASED",
        "is_active": true
      }
    },
    "subscriptions": {
      "pro_monthly": {
        "purchase_date": "2024-09-01T10:00:00.000Z",
        "expires_date": "2024-10-01T10:00:00.000Z",
        "store": "app_store",
        "environment": "production",
        "is_active": true
      }
    },
    "non_subscriptions": {}
  }
}
```

### `GET /v1/subscribers/:app_user_id`

Returns subscriber info with entitlements and subscriptions.

### `POST /v1/subscribers/:app_user_id/attributes`

Set subscriber attributes.

### `GET /v1/subscribers/:app_user_id/offerings`

SDK offerings response (RevenueCat-compatible shape).

### `POST /v1/subscribers/:app_user_id/intro_eligibility`

Returns eligibility map for product identifiers. Unknown values are returned as `null`.

### `GET /v1/subscribers/:app_user_id/health_report`

Returns a minimal health report payload (empty checks array).

### `GET /v1/subscribers/:app_user_id/health_report_availability`

Returns `{ \"report_logs\": true }`.

### `POST /v1/subscribers/identify`

Links an existing app user to a new user id and returns subscriber info.

### `POST /v1/subscribers/:app_user_id/attribution`

Accepts attribution payloads (no-op storage, returns `204`).

### `POST /v1/subscribers/:app_user_id/adservices_attribution`

Accepts AdServices token payloads (no-op storage, returns `204`).

### `POST /v1/offers`

Offer signing endpoint. Returns a signature error unless configured.

### `POST /v1/subscribers/redeem_purchase`

Redeem web purchase tokens and return subscriber info.

### `GET /v1/subscribers/:app_user_id/virtual_currencies`

Returns `{ \"virtual_currencies\": {} }`.

### `GET /v1/product_entitlement_mapping`

Returns product → entitlements mapping.

### `GET /v1/customercenter/:app_user_id`

Returns a minimal customer center configuration.

### `POST /v1/customercenter/support/create-ticket`

Accepts support ticket submissions and returns `{ \"status\": \"received\" }`.

### `GET /v1/products` (custom management)

List products for the app.

### `POST /v1/products` (custom management)

Create a product.

### `GET /v1/offerings` (custom management)

List offerings with attached products.

Note: this is a management endpoint and does not match the SDK `GET /v1/subscribers/:id/offerings` response shape.

### `POST /v1/offerings` (custom management)

Create an offering.

### `POST /v1/webhooks`

Receive webhook events from upstream systems.

## admin

Admin endpoints require Basic auth only when `BASIC_AUTH_PASSWORD` is configured.

### `GET /admin/health`

Returns `{ status: "ok" }`.

### `GET /admin/apps`

List apps and API keys.

### `POST /admin/apps`

Create an app and default API key.

### `POST /admin/apps/:id/keys`

Create a new API key.

### `POST /admin/apps/:id/keys/:key_id/revoke`

Revoke an API key.

### `GET /admin/overview`

Dashboard data payload. Optional `app_id` query param.
