# Webhooks

OpenRevenue accepts webhook events from upstream systems to keep subscriptions current.

## Endpoint

- `POST /v1/webhooks`

Payload:

```json
{
  "type": "RENEWAL",
  "app_user_id": "user_123",
  "product_id": "pro_monthly",
  "entitlement_id": "pro_monthly",
  "expires_date_ms": 1719999999999,
  "price_cents": 1299,
  "currency": "USD",
  "store": "app_store"
}
```

## Behaviors

- `RENEWAL`, `INITIAL_PURCHASE`, `NON_RENEWING_PURCHASE`: writes active subscription + entitlement.
- `CANCELLATION`, `EXPIRATION`: deactivates subscriptions + entitlements.
- All webhook payloads are stored in `webhook_events`.

## Security

If you need signature validation, add a shared secret and verify before processing.
