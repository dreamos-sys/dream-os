// DREAM OS - GLOBAL CONFIGURATION
window.DREAM_CONFIG = {
    // Application
    VERSION: '1.0.0',
    BUILD: '2024.01.03',
    ENV: 'production',
    
    // Supabase
    SUPABASE: {
        URL: 'https://ywtypkgjvbjwhmapmygb.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dHB5a2dqdmJqd2htYXBteWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI5OTcsImV4cCI6MjA4MjQ4ODk5N30.MA78j8WLwOO9nxR36tikN7jBQLjbYWYvTZn___eXBkk'
    },
    
    // WhatsApp Integration
    WHATSAPP: {
        KOORDINATOR: '+628886183954',
        MAINTENANCE: '+62...',
        SECURITY: '+62...',
        CLEANING: '+62...'
    },
    
    // Business Rules
    RULES: {
        OPERATING_HOURS: {
            weekday: { start: '07:30', end: '16:00' },
            friday: { start: '10:30', end: '13:00' }
        },
        BLOCKED_FRIDAY: ['Aula SMP', 'Serbaguna', 'Masjid'],
        MAX_BOOKING_DAYS: 30
    },
    
    // Modules Configuration
    MODULES: {
        booking: { enabled: true, requireAuth: false },
        k3: { enabled: true, requireAuth: false },
        security: { enabled: true, requireAuth: true },
        admin: { enabled: true, requireAuth: true },
        ghost: { enabled: true, requireAuth: true }
    },
    
    // Ghost Mode
    GHOST: {
        CODE: '418626',
        ENABLED: true,
        AUTO_DESTROY: 3600 // seconds
    },
    
    // UI Settings
    UI: {
        theme: 'dark',
        language: 'id',
        animations: true,
        highContrast: false
    }
};

// Initialize Supabase Client
window.supabase = supabase.createClient(
    DREAM_CONFIG.SUPABASE.URL,
    DREAM_CONFIG.SUPABASE.ANON_KEY
);

// Global Utilities
window.DREAM_UTILS = {
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    },
    
    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    },
    
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    getToastIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || 'ℹ️';
    },
    
    formatPhone(phone) {
        return phone.replace(/\D/g, '');
    },
    
    generateCode(prefix = 'BK') {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    },
    
    async checkInternet() {
        return navigator.onLine;
    }
};

console.log(`🚀 DREAM OS v${DREAM_CONFIG.VERSION} initialized`);
