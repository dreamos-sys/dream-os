class SecurityManager {
    constructor() {
        this.setupSecurityHeaders();
        this.enableCSP();
        this.setupInputSanitization();
        this.monitorSuspiciousActivity();
    }
    
    setupSecurityHeaders() {
        // Add security headers via meta tags
        const metaCSP = document.createElement('meta');
        metaCSP.httpEquiv = 'Content-Security-Policy';
        metaCSP.content = "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval';";
        document.head.appendChild(metaCSP);
    }
    
    enableCSP() {
        // Content Security Policy
        const csp = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            'style-src': ["'self'", "'unsafe-inline'", "https:"],
            'img-src': ["'self'", "data:", "blob:", "https:"],
            'connect-src': ["'self'", "https://*.supabase.co", "https://*.github.io"],
            'font-src': ["'self'", "https:", "data:"],
            'media-src': ["'self'", "data:", "blob:"],
            'object-src': ["'none'"],
            'frame-ancestors': ["'self'"]
        };
    }
    
    sanitizeInput(input) {
        // Basic input sanitization
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#96;');
    }
    
    monitorSuspiciousActivity() {
        // Detect multiple failed logins
        let failedAttempts = 0;
        const maxAttempts = 5;
        
        // Override login function to add monitoring
        const originalLogin = window.login;
        window.login = function(password, mode) {
            const passwordMap = {
                'user': 'user_@1234',
                'admin': '@dm1n_Sec2025',
                'ghost': '418626',
                'inventory': '4dm1in_6969@01',
                'warehouse': '4dm1n_9696@02'
            };
            
            if (password === passwordMap[mode]) {
                failedAttempts = 0; // Reset on success
                return originalLogin.apply(this, arguments);
            } else {
                failedAttempts++;
                
                if (failedAttempts >= maxAttempts) {
                    // Trigger security alert
                    this.triggerSecurityAlert({
                        type: 'brute_force_attempt',
                        attempts: failedAttempts,
                        timestamp: new Date().toISOString(),
                        ip: 'N/A' // Would get from server
                    });
                    
                    // Lock account temporarily
                    setTimeout(() => {
                        failedAttempts = 0;
                    }, 300000); // 5 minutes lock
                    
                    alert('⚠️ Terlalu banyak percobaan gagal. Coba lagi dalam 5 menit.');
                    return false;
                }
                
                return false;
            }
        }.bind(this);
    }
    
    triggerSecurityAlert(data) {
        console.warn('🚨 Security Alert:', data);
        
        // Send alert to server
        fetch('https://ywtypkgjvbjwhmapmygb.supabase.co/rest/v1/security_alerts', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dHB5a2dqdmJqd2htYXBteWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI5OTcsImV4cCI6MjA4MjQ4ODk5N30.MA78j8WLwOO9nxR36tikN7jBQLjbYWYvTZn___eXBkk',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}

// Initialize security
window.securityManager = new SecurityManager();
