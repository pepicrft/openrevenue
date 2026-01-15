# OpenRevenue Docs

Welcome to the OpenRevenue documentation. OpenRevenue is a Cloudflare-native subscription management backend that supports multiple client SDKs. It is compatible with common receipt, entitlement, and subscriber flows so teams can keep their existing clients while moving server-side logic to the edge.

## Supported SDKs

- RevenueCat SDKs
- Superwall SDKs (client-side purchase flows that can point to a compatible backend)
- Custom in-house SDKs modeled after RevenueCat-style receipt validation

## SDK compatibility matrix

| SDK | Backend URL override | Status |
| --- | --- | --- |
| RevenueCat | Yes | Supported |
| Superwall | Yes (custom network environment) | Supported |
| Adapty | No (not publicly exposed) | Not supported |
| Custom RevenueCat-style | Yes | Supported |

## Not supported

- Adapty SDKs (public API does not allow overriding the backend base URL)

> If you need another SDK compatibility layer, add it to the list and document the behavior in `docs/receipt-validation.md` and `docs/api.md`.

## Contents

- [Overview & Architecture](./overview.md)
- [API Reference](./api.md)
- [Receipt Validation](./receipt-validation.md)
- [Webhooks](./webhooks.md)
- [Dashboard Usage](./dashboard.md)
- [Local Development & Seeding](./local-dev.md)
- [Deployment (Cloudflare)](./deployment.md)
- [Legal & Licensing Notes](./legal.md)
