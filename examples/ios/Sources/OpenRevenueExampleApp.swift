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

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "dollarsign.circle.fill")
                .imageScale(.large)
                .font(.system(size: 60))
                .foregroundStyle(.green)
            
            Text("OpenRevenue Example")
                .font(.title)
                .fontWeight(.bold)
            
            Text("RevenueCat SDK integrated")
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
