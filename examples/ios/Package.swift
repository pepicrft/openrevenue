// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "OpenRevenueExample",
    platforms: [
        .iOS(.v15)
    ],
    dependencies: [
        .package(url: "https://github.com/RevenueCat/purchases-ios.git", from: "5.52.1")
    ],
    targets: [
        .executableTarget(
            name: "OpenRevenueExample",
            dependencies: [
                .product(name: "RevenueCat", package: "purchases-ios")
            ],
            path: "Sources"
        )
    ]
)
