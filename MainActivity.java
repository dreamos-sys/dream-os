package com.dreamos.school;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class MainActivity extends LauncherActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize app analytics
        initAnalytics();
        
        // Check for deep links
        handleDeepLinks(getIntent());
        
        // Setup push notifications
        setupNotifications();
    }
    
    private void initAnalytics() {
        // Initialize Firebase or other analytics
        try {
            // FirebaseApp.initializeApp(this);
            // Analytics tracking code here
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void handleDeepLinks(Intent intent) {
        if (intent != null && intent.getData() != null) {
            // Handle deep links like dreamos://app/booking?id=123
            Uri data = intent.getData();
            String path = data.getPath();
            
            // You can route to specific sections of your PWA
            if (path != null && path.contains("/booking")) {
                // Could pass data to web app via query parameters
            }
        }
    }
    
    private void setupNotifications() {
        // Request notification permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, 
                    Manifest.permission.POST_NOTIFICATIONS) != 
                    PackageManager.PERMISSION_GRANTED) {
                
                ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    1001);
            }
        }
        
        // Initialize FCM
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    String token = task.getResult();
                    // Send token to your server
                    sendTokenToServer(token);
                }
            });
    }
    
    private void sendTokenToServer(String token) {
        // Send FCM token to your backend
        // This enables push notifications
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // App came to foreground
        sendAppStateToWeb("foreground");
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        // App went to background
        sendAppStateToWeb("background");
    }
    
    private void sendAppStateToWeb(String state) {
        // Could communicate with web app via JavaScript interface
        // or query parameters
    }
}
