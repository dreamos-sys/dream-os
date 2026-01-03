// Admin Panel Module
export function init() {
    console.log('👔 Admin panel loaded');
    
    const container = document.getElementById('admin');
    if(container) {
        container.innerHTML += `
            <div style="margin-top:20px">
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px">
                    <div style="padding:15px;background:rgba(0,107,86,0.2);border-radius:10px">
                        <h3>📦 Inventaris</h3>
                        <p>Kelola barang & alat</p>
                        <button onclick="openInventory()" style="padding:8px 15px;background:#006B56;color:white;border:none;border-radius:5px;margin-top:10px">
                            Buka
                        </button>
                    </div>
                    
                    <div style="padding:15px;background:rgba(212,175,55,0.2);border-radius:10px">
                        <h3>🏚️ Gudang</h3>
                        <p>Kelola stok gudang</p>
                        <button onclick="openWarehouse()" style="padding:8px 15px;background:#D4AF37;color:#0a0a2a;border:none;border-radius:5px;margin-top:10px">
                            Buka
                        </button>
                    </div>
                </div>
                
                <div style="margin-top:30px">
                    <h3>📊 Quick Stats</h3>
                    <div id="adminStats" style="padding:15px;background:rgba(255,255,255,0.05);border-radius:10px">
                        Loading statistics...
                    </div>
                </div>
            </div>
        `;
        
        loadAdminStats();
    }
}

async function loadAdminStats() {
    try {
        const [bookings, k3, security] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact' }),
            supabase.from('k3_reports').select('*', { count: 'exact' }),
            supabase.from('security_reports').select('*', { count: 'exact' })
        ]);
        
        const stats = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
                <div>
                    <div style="font-size:2rem">${bookings.count || 0}</div>
                    <small>Bookings</small>
                </div>
                <div>
                    <div style="font-size:2rem">${k3.count || 0}</div>
                    <small>K3 Reports</small>
                </div>
                <div>
                    <div style="font-size:2rem">${security.count || 0}</div>
                    <small>Security Reports</small>
                </div>
            </div>
        `;
        
        document.getElementById('adminStats').innerHTML = stats;
    } catch(error) {
        console.error('Error loading stats:', error);
    }
}

window.openInventory = function() {
    alert('Inventory management akan datang!');
};

window.openWarehouse = function() {
    alert('Warehouse management akan datang!');
};
