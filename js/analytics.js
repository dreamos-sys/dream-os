class DreamAnalytics {
    logEvent(eventName, data = {}) {
        const log = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('dreamos_mode'),
            device: navigator.userAgent
        };
        
        // Save to local
        const logs = JSON.parse(localStorage.getItem('dream_logs') || '[]');
        logs.push(log);
        localStorage.setItem('dream_logs', JSON.stringify(logs.slice(-1000)));
        
        // Send to server jika online
        if (navigator.onLine) {
            fetch('https://api.dreamos.app/log', {
                method: 'POST',
                body: JSON.stringify(log)
            });
        }
    }
}

// Usage:
const analytics = new DreamAnalytics();
analytics.logEvent('page_view', { page: 'dashboard' });
