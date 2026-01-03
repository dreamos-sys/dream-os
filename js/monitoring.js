class LaunchMonitor {
    constructor() {
        this.startTime = Date.now();
        this.errors = [];
        this.performance = {};
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        // Error tracking
        window.addEventListener('error', (e) => {
            this.trackError(e);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e.reason);
        });
        
        // Performance monitoring
        this.monitorPerformance();
        
        // User interaction tracking
        this.trackUserInteractions();
    }
    
    trackError(error) {
        const errorData = {
            timestamp: new Date().toISOString(),
            message: error.message || error.toString(),
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            memory: performance.memory?.usedJSHeapSize || 'N/A'
        };
        
        this.errors.push(errorData);
        
        // Log to console
        console.error('🚨 Error:', errorData);
        
        // Send to server if online
        if (navigator.onLine) {
            this.sendErrorReport(errorData);
        } else {
            // Store locally
            localStorage.setItem('pending_errors', 
                JSON.stringify(this.errors.slice(-50)));
        }
    }
    
    monitorPerformance() {
        // Core Web Vitals
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performance.lcp = lastEntry.renderTime || lastEntry.loadTime;
                console.log('📊 LCP:', this.performance.lcp);
            }).observe({type: 'largest-contentful-paint', buffered: true});
            
            // FID (First Input Delay)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.performance.fid = entry.processingStart - entry.startTime;
                    console.log('📊 FID:', this.performance.fid);
                });
            }).observe({type: 'first-input', buffered: true});
        }
        
        // Memory usage
        setInterval(() => {
            if (performance.memory) {
                this.performance.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
            }
        }, 30000);
    }
    
    sendErrorReport(errorData) {
        // Send to Supabase
        fetch('https://ywtypkgjvbjwhmapmygb.supabase.co/rest/v1/error_logs', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dHB5a2dqdmJqd2htYXBteWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI5OTcsImV4cCI6MjA4MjQ4ODk5N30.MA78j8WLwOO9nxR36tikN7jBQLjbYWYvTZn___eXBkk',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        }).catch(() => {
            // Fallback to localStorage
            localStorage.setItem('pending_errors', 
                JSON.stringify(this.errors.slice(-50)));
        });
    }
    
    generateLaunchReport() {
        const report = {
            launchId: 'DREAM-OS-' + Date.now(),
            startTime: new Date(this.startTime).toISOString(),
            duration: Date.now() - this.startTime,
            totalErrors: this.errors.length,
            performance: this.performance,
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency,
                memory: navigator.deviceMemory,
                screen: `${screen.width}x${screen.height}`,
                online: navigator.onLine
            },
            featuresUsed: this.getUsedFeatures()
        };
        
        console.log('📈 Launch Report:', report);
        return report;
    }
}

// Auto-start monitoring
window.dreamMonitor = new LaunchMonitor();
