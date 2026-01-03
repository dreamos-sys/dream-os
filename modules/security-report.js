// Security Daily Report Module
export function init() {
    console.log('🛡️ Security system loaded');
    
    const container = document.getElementById('security');
    if(container) {
        container.innerHTML += `
            <div style="margin-top:20px">
                <div style="display:flex;gap:10px;margin-bottom:20px">
                    <button onclick="selectShift('pagi')" style="padding:10px;background:#006B56;color:white;border:none;border-radius:5px;flex:1">🌅 Pagi</button>
                    <button onclick="selectShift('sore')" style="padding:10px;background:#D4AF37;color:#0a0a2a;border:none;border-radius:5px;flex:1">🌇 Sore</button>
                    <button onclick="selectShift('malam')" style="padding:10px;background:#0a0a2a;color:white;border:1px solid #D4AF37;border-radius:5px;flex:1">🌃 Malam</button>
                </div>
                
                <textarea id="securityReport" placeholder="📝 Isi laporan harian security..." style="padding:15px;width:100%;min-height:150px;border-radius:10px;background:rgba(255,255,255,0.05);color:white;border:1px solid rgba(212,175,55,0.5)"></textarea>
                
                <input type="text" id="officerName" placeholder="👮 Nama Petugas" style="padding:10px;width:100%;margin:10px 0">
                
                <button onclick="submitSecurityReport()" style="padding:15px;background:#006B56;color:white;border:none;border-radius:10px;width:100%">
                    📊 Submit Laporan Harian
                </button>
            </div>
        `;
    }
}

let currentShift = 'pagi';

window.selectShift = function(shift) {
    currentShift = shift;
    alert(`Shift ${shift} dipilih`);
};

window.submitSecurityReport = async function() {
    const report = document.getElementById('securityReport').value;
    const officer = document.getElementById('officerName').value;
    
    if(!report || !officer) {
        alert('Harap isi laporan dan nama petugas!');
        return;
    }
    
    const message = `🛡️ LAPORAN SECURITY ${currentShift.toUpperCase()}\n\nPetugas: ${officer}\nShift: ${currentShift}\nLaporan: ${report}`;
    
    // Save to Supabase
    const { error } = await supabase
        .from('security_reports')
        .insert([{
            shift: currentShift,
            report: report,
            officer: officer,
            status: 'submitted'
        }]);
    
    if(!error) {
        window.open(`https://wa.me/628886183954?text=${encodeURIComponent(message)}`, '_blank');
        alert('✅ Laporan security dikirim!');
        document.getElementById('securityReport').value = '';
        document.getElementById('officerName').value = '';
    }
};
