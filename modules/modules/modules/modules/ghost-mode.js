// Ghost Stealth Mode Module
export function init() {
    console.log('👻 Ghost mode loaded');
    
    const container = document.getElementById('ghost');
    if(container) {
        container.innerHTML += `
            <div style="margin-top:20px;padding:20px;background:rgba(255,255,255,0.05);border-radius:15px;border:2px solid #40E0D0">
                <h3 style="color:#40E0D0">🛠️ Developer Tools</h3>
                
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:20px 0">
                    <button onclick="clearCache()" style="padding:10px;background:rgba(255,71,87,0.2);color:#ff4757;border:1px solid #ff4757;border-radius:5px">
                        🧹 Clear Cache
                    </button>
                    <button onclick="exportData()" style="padding:10px;background:rgba(0,107,86,0.2);color:#006B56;border:1px solid #006B56;border-radius:5px">
                        📤 Export Data
                    </button>
                    <button onclick="showLogs()" style="padding:10px;background:rgba(212,175,55,0.2);color:#D4AF37;border:1px solid #D4AF37;border-radius:5px">
                        📋 System Logs
                    </button>
                    <button onclick="toggleDebug()" style="padding:10px;background:rgba(64,224,208,0.2);color:#40E0D0;border:1px solid #40E0D0;border-radius:5px">
                        🐛 Debug Mode
                    </button>
                </div>
                
                <div style="margin-top:20px">
                    <h4>System Information:</h4>
                    <div id="systemInfo" style="padding:10px;background:black;color:#00ff00;border-radius:5px;font-family:monospace;font-size:12px">
                        Loading system info...
                    </div>
                </div>
            </div>
        `;
        
        loadSystemInfo();
    }
}

function loadSystemInfo() {
    const info = {
        appVersion: '1.0.0',
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        localStorage: Object.keys(localStorage).length + ' items',
        serviceWorker: 'active',
        supabase: 'connected',
        lastAccess: new Date().toLocaleString()
    };
    
    document.getElementById('systemInfo').textContent = JSON.stringify(info, null, 2);
}

window.clearCache = function() {
    if(confirm('Clear all cache?')) {
        localStorage.clear();
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
        alert('✅ Cache cleared!');
        location.reload();
    }
};

window.exportData = function() {
    const data = {
        localStorage: { ...localStorage },
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-os-backup-${Date.now()}.json`;
    a.click();
    
    alert('📥 Data exported!');
};

window.showLogs = function() {
    alert('System logs akan ditampilkan di console (F12)');
    console.log('=== DREAM OS SYSTEM LOGS ===');
    console.log('LocalStorage:', localStorage);
    console.log('User Agent:', navigator.userAgent);
};

window.toggleDebug = function() {
    const debug = localStorage.getItem('debug') === 'true';
    localStorage.setItem('debug', !debug);
    alert(`Debug mode ${!debug ? 'enabled' : 'disabled'}!`);
    location.reload();
};
