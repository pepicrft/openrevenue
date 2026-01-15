# Receipt Validation

OpenRevenue validates receipts with Apple and Google. At least one store credential must be set or the worker will refuse to start.

## Apple App Store

Required env var:

- `APPLE_SHARED_SECRET`

OpenRevenue calls `https://buy.itunes.apple.com/verifyReceipt` and retries in sandbox if a `21007` response is returned.

Required fields in `/v1/receipts`:

- `receipt_data`
- `product_id` (used as a fallback if not present in receipt payload)

## Google Play

Required env vars:

- `GOOGLE_SERVICE_ACCOUNT_JSON` (stringified JSON)
- `GOOGLE_PLAY_PACKAGE_NAME` (optional if provided per request)

OpenRevenue obtains an OAuth2 access token and calls the Android Publisher API.

Required fields in `/v1/receipts`:

- `purchase_token`
- `product_id`
- `package_name` (optional if `GOOGLE_PLAY_PACKAGE_NAME` is set)

## Notes

- Store responses are persisted in `receipts` for audit/debugging.
- Amount and currency are optional; include them if you want MRR calculations.
- Receipt validation writes to `subscriptions`, `entitlements`, and `events`.
