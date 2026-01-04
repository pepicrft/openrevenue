package me.pepicrft.openrevenueexample

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.Offerings
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import com.revenuecat.purchases.getCustomerInfoWith
import com.revenuecat.purchases.getOfferingsWith
import java.net.URL

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Only set proxy URL and debug logs in debug builds
        if (BuildConfig.DEBUG) {
            // Point to local OpenRevenue instance for testing
            // 10.0.2.2 is the host machine's localhost from Android emulator
            // Change to your local IP when testing on a real device
            Purchases.proxyURL = URL("http://10.0.2.2:8787")
            
            // Enable debug logs
            Purchases.logLevel = LogLevel.DEBUG
        }
        
        // Configure RevenueCat with your API key
        // The API key should match one in your OpenRevenue database
        Purchases.configure(
            PurchasesConfiguration.Builder(this, "rc_test_openrevenue").build()
        )
        
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    OpenRevenueExampleScreen()
                }
            }
        }
    }
}

@Composable
fun OpenRevenueExampleScreen() {
    var customerInfo by remember { mutableStateOf<CustomerInfo?>(null) }
    var offerings by remember { mutableStateOf<Offerings?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    
    fun fetchData() {
        isLoading = true
        errorMessage = null
        
        Purchases.sharedInstance.getCustomerInfoWith(
            onError = { error ->
                Log.e("OpenRevenue", "Error fetching customer info: ${error.message}")
                errorMessage = error.message
                isLoading = false
            },
            onSuccess = { info ->
                customerInfo = info
                
                Purchases.sharedInstance.getOfferingsWith(
                    onError = { error ->
                        Log.e("OpenRevenue", "Error fetching offerings: ${error.message}")
                        errorMessage = error.message
                        isLoading = false
                    },
                    onSuccess = { offs ->
                        offerings = offs
                        isLoading = false
                    }
                )
            }
        )
    }
    
    LaunchedEffect(Unit) {
        fetchData()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Spacer(modifier = Modifier.height(20.dp))
        Text(text = "💰", fontSize = 60.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "OpenRevenue Example",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(24.dp))
        
        // Customer Info Card
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Customer Info",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                customerInfo?.let { info ->
                    InfoRow("User ID", info.originalAppUserId)
                    InfoRow("Active Subscriptions", "${info.activeSubscriptions.size}")
                    InfoRow("Entitlements", "${info.entitlements.active.size}")
                } ?: Text(
                    text = "Not loaded",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Offerings Card
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Offerings",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                offerings?.current?.let { current ->
                    Text(
                        text = current.identifier,
                        fontWeight = FontWeight.Medium
                    )
                    current.availablePackages.forEach { pkg ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = pkg.identifier)
                            Text(
                                text = pkg.product.price.formatted,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } ?: Text(
                    text = "Not loaded",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        // Error Card
        errorMessage?.let { error ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = error,
                    modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Refresh Button
        Button(
            onClick = { fetchData() },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text("Fetch Data")
        }
        
        if (BuildConfig.DEBUG) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Pointing to: 10.0.2.2:8787",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontWeight = FontWeight.Medium
        )
    }
}
