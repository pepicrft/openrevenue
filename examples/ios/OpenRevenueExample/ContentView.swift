import SwiftUI
import RevenueCat

struct ContentView: View {
    @State private var customerInfo: CustomerInfo?
    @State private var offerings: Offerings?
    @State private var errorMessage: String?
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "dollarsign.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.green)
                        
                        Text("OpenRevenue Example")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .padding(.top, 20)
                    
                    // Customer Info Section
                    GroupBox("Customer Info") {
                        if let info = customerInfo {
                            VStack(alignment: .leading, spacing: 8) {
                                InfoRow(label: "User ID", value: info.originalAppUserId)
                                InfoRow(label: "Active Subscriptions", value: "\(info.activeSubscriptions.count)")
                                InfoRow(label: "Entitlements", value: "\(info.entitlements.active.count)")
                            }
                        } else {
                            Text("Not loaded")
                                .foregroundStyle(.secondary)
                        }
                    }
                    
                    // Offerings Section
                    GroupBox("Offerings") {
                        if let offerings = offerings {
                            if let current = offerings.current {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(current.identifier)
                                        .font(.headline)
                                    ForEach(current.availablePackages, id: \.identifier) { package in
                                        HStack {
                                            Text(package.identifier)
                                            Spacer()
                                            Text(package.localizedPriceString)
                                                .foregroundStyle(.secondary)
                                        }
                                        .padding(.vertical, 4)
                                    }
                                }
                            } else {
                                Text("No current offering")
                                    .foregroundStyle(.secondary)
                            }
                        } else {
                            Text("Not loaded")
                                .foregroundStyle(.secondary)
                        }
                    }
                    
                    // Error Section
                    if let error = errorMessage {
                        GroupBox {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }
                    }
                    
                    // Actions
                    VStack(spacing: 12) {
                        Button(action: fetchData) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "arrow.clockwise")
                                }
                                Text("Fetch Data")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(isLoading)
                        
                        Text("Pointing to: localhost:8787")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
            }
            .navigationTitle("OpenRevenue")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            fetchData()
        }
    }
    
    private func fetchData() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Fetch customer info
                let info = try await Purchases.shared.customerInfo()
                await MainActor.run {
                    self.customerInfo = info
                }
                
                // Fetch offerings
                let offerings = try await Purchases.shared.offerings()
                await MainActor.run {
                    self.offerings = offerings
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

#Preview {
    ContentView()
}
