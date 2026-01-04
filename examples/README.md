# OpenRevenue Example Apps

Example iOS and Android apps demonstrating RevenueCat SDK integration with OpenRevenue as the backend.

## Setup

### 1. Start OpenRevenue locally

```bash
# From the repository root
pnpm install
pnpm -C packages/worker wrangler d1 create openrevenue
pnpm -C packages/worker wrangler d1 migrations apply openrevenue --local

# Insert a test app with API key matching the examples
pnpm -C packages/worker wrangler d1 execute openrevenue --local --command \
  "INSERT INTO apps (id, name, api_key, created_at) VALUES ('app_1', 'Example', 'rc_test_openrevenue', datetime('now'))"

# Start the worker
pnpm -C packages/worker dev
```

The worker will be available at `http://localhost:8787`.

### 2. Run the example apps

#### iOS

1. Open `examples/ios/OpenRevenueExample.xcodeproj` in Xcode
2. Select the `Products.storekit` configuration for StoreKit testing
3. Run on simulator or device

**Note:** When running on a real device, update the proxy URL in `OpenRevenueExampleApp.swift` to your machine's local IP address.

#### Android

```bash
cd examples/android
./gradlew installDebug
```

**Note:** The Android emulator uses `10.0.2.2` to reach the host machine's localhost. When running on a real device, update the proxy URL in `MainActivity.kt` to your machine's local IP address.

## Configuration

Both apps are pre-configured to:

1. **Point to localhost** - Using `Purchases.proxyURL` to route all RevenueCat API calls to your local OpenRevenue instance
2. **Use a test API key** - `rc_test_openrevenue` (must match an entry in your OpenRevenue database)
3. **Enable debug logging** - To help troubleshoot integration issues

## StoreKit Testing (iOS)

The iOS example includes a `Products.storekit` configuration file with:

- **Non-consumable:** Remove Ads ($0.99)
- **Subscriptions:**
  - Premium Monthly ($4.99/month with $0.99 intro offer)
  - Premium Yearly ($39.99/year)

To use StoreKit testing in Xcode:
1. Edit Scheme → Run → Options → StoreKit Configuration
2. Select `Products.storekit`

## Testing on Real Devices

When testing on physical devices, you'll need to:

1. Update the proxy URL to your machine's local IP:
   - **iOS:** `Purchases.proxyURL = URL(string: "http://YOUR_IP:8787")`
   - **Android:** `Purchases.proxyURL = URI.create("http://YOUR_IP:8787")`

2. Ensure your device and machine are on the same network

3. For production-like testing, use Apple/Google sandbox accounts
