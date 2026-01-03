// K3 System Module
export function init() {
    console.log('⚠️ K3 system loaded');
}

window.reportK3Detail = function(type) {
    const jenis = {
        'kerusakan': { icon: '🔧', target: 'Maintenance' },
        'kehilangan': { icon: '🛡️', target: 'Security' },
        'kebersihan': { icon: '🧹', target: 'Cleaning Service' }
    };
    
    const form = `
        <div style="margin-top:20px">
            <h3>${jenis[type].icon} Laporan ${type} (→ ${jenis[type].target})</h3>
            <input type="text" id="k3Location" placeholder="📍 Lokasi" style="padding:10px;width:100%;margin:5px 0">
            <textarea id="k3Desc" placeholder="📝 Deskripsi masalah" style="padding:10px;width:100%;margin:5px 0;min-height:100px"></textarea>
            <select id="k3Urgency" style="padding:10px;width:100%;margin:5px 0">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical!</option>
            </select>
            <button onclick="submitK3('${type}')" style="padding:15px;background:#ff4757;color:white;border:none;border-radius:10px;width:100%;margin-top:10px">
                📤 Kirim Laporan
            </button>
        </div>
    `;
    
    document.getElementById('k3').innerHTML += form;
};

window.submitK3 = async function(type) {
    const location = document.getElementById('k3Location').value;
    const desc = document.getElementById('k3Desc').value;
    const urgency = document.getElementById('k3Urgency').value;
    
    if(!location || !desc) {
        alert('Harap isi lokasi dan deskripsi!');
        return;
    }
    
    const message = `⚠️ LAPORAN K3: ${type}\n\nLokasi: ${location}\nDeskripsi: ${desc}\nUrgensi: ${urgency}\n\nTindakan: ${type === 'kerusakan' ? 'Maintenance' : type === 'kehilangan' ? 'Security' : 'Cleaning Service'}`;
    
    // Save to Supabase
    const { error } = await supabase
        .from('k3_reports')
        .insert([{
            type: type,
            location: location,
            description: desc,
            urgency: urgency,
            status: 'pending'
        }]);
    
    if(!error) {
        window.open(`https://wa.me/628886183954?text=${encodeURIComponent(message)}`, '_blank');
        alert('✅ Laporan K3 dikirim!');
    }
};
