// Booking System Module
export function init() {
    console.log('📅 Booking system loaded');
    
    const container = document.getElementById('booking');
    if(container) {
        container.innerHTML += `
            <div style="margin-top:20px">
                <h3>🏟️ Pilih Fasilitas:</h3>
                <select id="facility" style="padding:10px;width:100%;margin:10px 0">
                    <option value="">-- Pilih --</option>
                    <option value="aula_smp">Aula SMP</option>
                    <option value="aula_sma">Aula SMA</option>
                    <option value="masjid">Masjid</option>
                    <option value="labkom">Labkom</option>
                </select>
                
                <h3>📅 Pilih Tanggal:</h3>
                <input type="date" id="bookingDate" style="padding:10px;width:100%;margin:10px 0">
                
                <h3>🕒 Pilih Waktu:</h3>
                <select id="bookingTime" style="padding:10px;width:100%;margin:10px 0">
                    <option value="08:00">08:00-09:00</option>
                    <option value="09:00">09:00-10:00</option>
                    <option value="10:00">10:00-11:00</option>
                </select>
                
                <button onclick="submitBooking()" style="padding:15px;background:#D4AF37;color:#0a0a2a;border:none;border-radius:10px;width:100%;margin-top:20px">
                    📤 Ajukan ke Pak Erwin
                </button>
            </div>
        `;
    }
}

window.submitBooking = async function() {
    const facility = document.getElementById('facility').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    
    if(!facility || !date || !time) {
        alert('Harap isi semua data!');
        return;
    }
    
    const message = `📅 BOOKING BARU\n\nFasilitas: ${facility}\nTanggal: ${date}\nWaktu: ${time}\nStatus: Menunggu approval`;
    
    // Save to Supabase
    const { error } = await supabase
        .from('bookings')
        .insert([{
            facility: facility,
            date: date,
            time: time,
            status: 'pending'
        }]);
    
    if(!error) {
        // WhatsApp ke Pak Erwin
        window.open(`https://wa.me/628886183954?text=${encodeURIComponent(message)}`, '_blank');
        alert('✅ Booking diajukan ke Pak Erwin!');
    }
};
