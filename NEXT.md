# Next Steps

Prioritized tasks to move OpenRevenue forward, based on PLAN.md "Later" items and current project state.

## 1. Metrics Aggregation and Dashboard Charts

The dashboard currently shows basic metrics (active subscribers, MRR, churn). Expand this with:

- [ ] Add time-series aggregation for daily/weekly/monthly revenue
- [ ] Implement subscriber growth charts over time
- [ ] Add product-level breakdown (revenue per product, top products)
- [ ] Create cohort retention visualization
- [ ] Add export functionality (CSV/JSON) for metrics

## 2. Multi-Environment Support (Sandbox vs Production)

Critical for testing without affecting production data:

- [ ] Add `environment` field to apps table (`sandbox` | `production`)
- [ ] Route Apple/Google receipt validation to sandbox or production endpoints based on environment
- [ ] Separate KV namespaces or key prefixes per environment
- [ ] Add environment indicator in dashboard UI
- [ ] Allow switching environments in admin panel

## 3. Customer Aliasing and Identity Stitching

Enable tracking users across anonymous and authenticated states:

- [ ] Create `customer_aliases` table linking multiple `app_user_id` values
- [ ] Implement `/v1/subscribers/alias` endpoint to merge identities
- [ ] Update subscriber lookup to resolve aliases
- [ ] Handle entitlement merging when identities are stitched
- [ ] Add alias history for audit trail

## 4. Promotional Entitlements and Introductory Offers

Support free trials and promotional pricing:

- [ ] Add `promotional_entitlements` table for manually granted access
- [ ] Implement admin endpoint to grant/revoke promotional entitlements
- [ ] Track introductory offer status from Apple/Google receipts
- [ ] Display promotional vs paid entitlements in dashboard
- [ ] Add expiration handling for time-limited promotions

## 5. Dashboard Runtime Configuration

Make deployment one-click by moving configuration to runtime:

- [ ] Remove build-time env vars (VITE_API_BASE_URL, VITE_ADMIN_PASSWORD, etc.)
- [ ] Serve dashboard config from worker endpoint (e.g., `/dashboard/config`)
- [ ] Load configuration at runtime on dashboard init
- [ ] Store admin credentials in D1 or worker secrets, not client-side
- [ ] Add first-run setup flow for initial admin password

## 6. Dashboard UI Improvements

Polish the admin experience:

- [ ] Add subscriber detail view (history, entitlements, receipts)
- [ ] Implement offerings/products CRUD in UI
- [ ] Add real-time updates via WebSocket or polling
- [ ] Create API key management UI
- [ ] Add dark/light theme toggle

## 7. Developer Experience

- [ ] Add OpenAPI/Swagger documentation generation
- [ ] Create SDK examples (iOS, Android, Flutter)
- [ ] Add integration test suite against local worker
- [ ] Improve error messages with actionable guidance
