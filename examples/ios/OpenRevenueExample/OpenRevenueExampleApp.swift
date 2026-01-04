import SwiftUI
import RevenueCat

@main
struct OpenRevenueExampleApp: App {
    init() {
        // Point to local OpenRevenue instance for testing
        // Change this to your local machine's IP when testing on a real device
        #if DEBUG
        Purchases.proxyURL = URL(string: "http://localhost:8787")
        #endif
        
        // Configure RevenueCat with your API key
        // The API key should match one in your OpenRevenue database
        Purchases.configure(withAPIKey: "rc_test_openrevenue")
        
        // Enable debug logs in development
        #if DEBUG
        Purchases.logLevel = .debug
        #endif
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
