import SwiftUI
import RevenueCat

@main
struct OpenRevenueExampleApp: App {
    init() {
        // Configure RevenueCat with your API key
        // Purchases.configure(withAPIKey: "your_api_key")
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
