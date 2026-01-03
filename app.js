// DREAM OS - MODULE ROUTER & CORE
import './modules/booking-system.js';
import './modules/k3-system.js';
import './modules/security-report.js';
import './modules/admin-panel.js';
import './modules/ghost-mode.js';

class DreamOS {
    constructor() {
        this.modules = {};
        this.currentModule = null;
        this.user = this.loadUser();
        this.initialize();
    }
    
    async initialize() {
        console.log('🌙 Initializing DREAM OS...');
        
        // Check authentication
        await this.checkAuth();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load default module
        this.loadModule('booking');
        
        // Update UI based on role
        this.updateUI();
        
        // Load offline data
        await this.loadOfflineData();
        
        console.log('✅ DREAM OS ready!');
    }
    
    async checkAuth() {
        const savedUser = localStorage.getItem('dream_user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        } else {
            // Default guest user
            this.user = {
                id: 'guest_' + Date.now(),
                name: 'Guest',
                role: 'user',
                phone: '',
                divisi: '',
                permissions: ['booking', 'k3']
            };
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.loadModule(module);
            });
        });
        
        // FAB Button
        document.getElementById('fab-button').addEventListener('click', () => {
            this.toggleFABMenu();
        });
        
        // User menu
        document.getElementById('user-menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });
        
        // Close menus when clicking outside
        document.addEventListener('click', () => {
            this.closeAllMenus();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Online/offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }
    
    async loadModule(moduleName) {
        // Check if module is enabled and user has permission
        if (!this.canAccessModule(moduleName)) {
            DREAM_UTILS.showToast('Akses ditolak untuk modul ini', 'error');
            return;
        }
        
        DREAM_UTILS.showLoading(`Loading ${moduleName}...`);
        
        try {
            // Update navigation
            this.updateNavigation(moduleName);
            
            // Clear current module
            if (this.currentModule && this.currentModule.destroy) {
                this.currentModule.destroy();
            }
            
            // Load module based on name
            switch(moduleName) {
                case 'booking':
                    await this.loadBookingModule();
                    break;
                case 'k3':
                    await this.loadK3Module();
                    break;
                case 'security':
                    await this.loadSecurityModule();
                    break;
                case 'admin':
                    await this.loadAdminModule();
                    break;
                case 'ghost':
                    await this.loadGhostModule();
                    break;
                default:
                    throw new Error(`Module ${moduleName} not found`);
            }
            
            // Update URL hash
            window.location.hash = moduleName;
            
            DREAM_UTILS.showToast(`Modul ${moduleName} loaded`, 'success');
            
        } catch (error) {
            console.error('Error loading module:', error);
            DREAM_UTILS.showToast(`Gagal memuat modul: ${error.message}`, 'error');
            
            // Fallback to booking module
            if (moduleName !== 'booking') {
                this.loadModule('booking');
            }
        } finally {
            DREAM_UTILS.hideLoading();
        }
    }
    
    async loadBookingModule() {
        const module = window.BookingSystem;
        if (!module) throw new Error('Booking module not available');
        
        this.currentModule = new module();
        await this.currentModule.init();
    }
    
    async loadK3Module() {
        const module = window.K3System;
        if (!module) throw new Error('K3 module not available');
        
        this.currentModule = new module();
        await this.currentModule.init();
    }
    
    async loadSecurityModule() {
        const module = window.SecuritySystem;
        if (!module) throw new Error('Security module not available');
        
        this.currentModule = new module();
        await this.currentModule.init();
    }
    
    async loadAdminModule() {
        const module = window.AdminSystem;
        if (!module) throw new Error('Admin module not available');
        
        this.currentModule = new module();
        await this.currentModule.init();
    }
    
    async loadGhostModule() {
        // Verify ghost access
        const ghostCode = localStorage.getItem('ghost_code');
        if (ghostCode !== DREAM_CONFIG.GHOST.CODE) {
            const input = prompt('🔐 Enter Ghost Code:');
            if (input !== DREAM_CONFIG.GHOST.CODE) {
                DREAM_UTILS.showToast('Invalid ghost code', 'error');
                this.loadModule('booking');
                return;
            }
            localStorage.setItem('ghost_code', input);
        }
        
        const module = window.GhostSystem;
        if (!module) throw new Error('Ghost module not available');
        
        this.currentModule = new module();
        await this.currentModule.init();
    }
    
    canAccessModule(moduleName) {
        const moduleConfig = DREAM_CONFIG.MODULES[moduleName];
        if (!moduleConfig || !moduleConfig.enabled) return false;
        
        if (moduleConfig.requireAuth && this.user.role === 'guest') {
            return false;
        }
        
        // Check role-based permissions
        const rolePermissions = {
            'user': ['booking', 'k3'],
            'security': ['booking', 'k3', 'security'],
            'admin': ['booking', 'k3', 'security', 'admin'],
            'ghost': ['booking', 'k3', 'security', 'admin', 'ghost']
        };
        
        return rolePermissions[this.user.role]?.includes(moduleName) || false;
    }
    
    updateNavigation(activeModule) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-module="${activeModule}"]`);
        if (activeItem) activeItem.classList.add('active');
    }
    
    updateUI() {
        // Show/hide admin/ghost nav items
        const isAdmin = ['admin', 'ghost'].includes(this.user.role);
        const isGhost = this.user.role === 'ghost';
        
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? 'flex' : 'none';
        });
        
        document.querySelectorAll('.ghost-only').forEach(el => {
            el.style.display = isGhost ? 'flex' : 'none';
        });
        
        // Update user info
        document.getElementById('user-name').textContent = this.user.name;
        document.getElementById('user-role').textContent = this.user.role.toUpperCase();
    }
    
    toggleFABMenu() {
        const menu = document.getElementById('fab-menu');
        menu.classList.toggle('show');
    }
    
    toggleUserMenu() {
        const menu = document.getElementById('user-dropdown');
        menu.classList.toggle('show');
    }
    
    closeAllMenus() {
        document.getElementById('fab-menu').classList.remove('show');
        document.getElementById('user-dropdown').classList.remove('show');
    }
    
    handleKeyboardShortcuts(e) {
        // Don't trigger in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case '1':
                this.loadModule('booking');
                break;
            case '2':
                this.loadModule('k3');
                break;
            case '3':
                this.loadModule('security');
                break;
            case '4':
                if (this.canAccessModule('admin')) this.loadModule('admin');
                break;
            case '5':
                if (this.canAccessModule('ghost')) this.loadModule('ghost');
                break;
            case 'Escape':
                this.closeAllMenus();
                break;
            case 'F1':
                e.preventDefault();
                this.quickHelp();
                break;
        }
    }
    
    async quickAction(action) {
        switch(action) {
            case 'new_booking':
                this.loadModule('booking');
                // Trigger new booking form
                if (this.currentModule && this.currentModule.showNewBooking) {
                    this.currentModule.showNewBooking();
                }
                break;
                
            case 'k3_report':
                this.loadModule('k3');
                break;
                
            case 'emergency':
                window.open(`https://wa.me/${DREAM_CONFIG.WHATSAPP.KOORDINATOR}?text=EMERGENCY%20ASSISTANCE%20NEEDED`, '_blank');
                break;
                
            case 'call_erwin':
                window.location.href = `tel:${DREAM_CONFIG.WHATSAPP.KOORDINATOR}`;
                break;
        }
        
        this.closeAllMenus();
    }
    
    async loadOfflineData() {
        // Load facilities, tools, etc. for offline use
        try {
            const [facilities, tools] = await Promise.all([
                this.cacheData('facilities'),
                this.cacheData('tools')
            ]);
            
            localStorage.setItem('offline_facilities', JSON.stringify(facilities));
            localStorage.setItem('offline_tools', JSON.stringify(tools));
            
            console.log('📦 Offline data cached');
        } catch (error) {
            console.warn('Could not cache offline data:', error);
        }
    }
    
    async cacheData(table) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('is_active', true);
        
        if (error) throw error;
        return data || [];
    }
    
    handleOnline() {
        DREAM_UTILS.showToast('🟢 Online - Syncing data...', 'success');
        // Sync offline queue
        this.syncOfflineQueue();
    }
    
    handleOffline() {
        DREAM_UTILS.showToast('🔴 Offline - Working locally', 'warning');
    }
    
    async syncOfflineQueue() {
        const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
        if (queue.length === 0) return;
        
        DREAM_UTILS.showToast(`Syncing ${queue.length} offline items...`, 'info');
        
        for (const item of queue) {
            try {
                await supabase.from(item.table).insert(item.data);
                console.log(`✅ Synced: ${item.table}`);
            } catch (error) {
                console.error(`❌ Sync failed:`, error);
            }
        }
        
        localStorage.removeItem('offline_queue');
        DREAM_UTILS.showToast('Sync complete!', 'success');
    }
    
    // Public API
    login() {
        // Simplified login for demo
        const name = prompt('Enter your name:');
        const phone = prompt('Enter your phone:');
        const divisi = prompt('Enter divisi (SD/SMP/SMA/UMUM):');
        
        if (name && phone && divisi) {
            this.user = {
                id: 'user_' + Date.now(),
                name: name,
                phone: phone,
                divisi: divisi,
                role: 'user',
                permissions: ['booking', 'k3']
            };
            
            localStorage.setItem('dream_user', JSON.stringify(this.user));
            this.updateUI();
            DREAM_UTILS.showToast(`Welcome ${name}!`, 'success');
        }
    }
    
    logout() {
        this.user = {
            id: 'guest_' + Date.now(),
            name: 'Guest',
            role: 'user',
            permissions: ['booking', 'k3']
        };
        
        localStorage.removeItem('dream_user');
        this.updateUI();
        this.loadModule('booking');
        DREAM_UTILS.showToast('Logged out', 'info');
    }
    
    settings() {
        alert('Settings panel coming soon!');
    }
    
    quickHelp() {
        const help = `
🎯 DREAM OS QUICK HELP

📅 BOOKING: 
- Pilih fasilitas, tanggal, waktu
- Submit ke Pak Erwin via WhatsApp

⚠️ K3 SYSTEM:
- Kerusakan → Maintenance
- Kehilangan → Security
- Kebersihan → Cleaning Service

🛡️ SECURITY:
- Laporan harian security
- Shift pagi/sore/malam

👔 ADMIN:
- Inventaris management
- Warehouse tracking
- User management

👻 GHOST:
- Developer tools
- System monitoring
- Emergency controls

📞 PAK ERWIN: ${DREAM_CONFIG.WHATSAPP.KOORDINATOR}
        `;
        
        alert(help);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DreamOS();
});
