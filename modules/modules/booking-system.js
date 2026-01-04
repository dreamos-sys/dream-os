// Booking System Module
export function init() {
    console.log('📅 Booking system loaded');
    
    const container = document.getElementById('bookingContent');
    if (container) {
        container.innerHTML = `
            <div style="margin-top:20px">
                <div style="display:grid; gap:15px">
                    <div>
                        <label style="display:block; margin-bottom:5px; color:#D4AF37">🏟️ Pilih Fasilitas:</label>
                        <select id="facility" style="padding:12px; width:100%; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:1px solid #D4AF37">
                            <option value="">-- Pilih Fasilitas --</option>
                            <option value="aula_smp">Aula SMP</option>
                            <option value="aula_sma">Aula SMA</option>
                            <option value="masjid">Masjid</option>
                            <option value="labkom">Lab Komputer</option>
                            <option value="lapangan">Lapangan Olahraga</option>
                            <option value="ruang_guru">Ruang Guru</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display:block; margin-bottom:5px; color:#D4AF37">📅 Tanggal:</label>
                        <input type="date" id="bookingDate" style="padding:12px; width:100%; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:1px solid #D4AF37">
                    </div>
                    
                    <div>
                        <label style="display:block; margin-bottom:5px; color:#D4AF37">🕒 Waktu:</label>
                        <select id="bookingTime" style="padding:12px; width:100%; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:1px solid #D4AF37">
                            <option value="">-- Pilih Waktu --</option>
                            <option value="08:00">08:00-09:00</option>
                            <option value="09:00">09:00-10:00</option>
                            <option value="10:00">10:00-11:00</option>
                            <option value="13:00">13:00-15:00</option>
                            <option value="15:00">15:00-17:00</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display:block; margin-bottom:5px; color:#D4AF37">📝 Tujuan:</label>
                        <textarea id="bookingPurpose" placeholder="Kegiatan/acara yang akan dilaksanakan" style="padding:12px; width:100%; min-height:80px; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:1px solid #D4AF37"></textarea>
                    </div>
                    
                    <button onclick="submitBooking()" 
                            style="padding:15px; background:#D4AF37; color:#0a0a2a; border:none; border-radius:10px; width:100%; font-weight:bold; font-size:1.1rem; margin-top:10px">
                        📤 Ajukan Booking ke Pak Erwin
                    </button>
                </div>
                
                <div style="margin-top:30px">
                    <h3 style="color:#D4AF37">📋 Booking Terbaru</h3>
                    <div id="recentBookings" style="padding:15px; background:rgba(0,0,0,0.3); border-radius:10px; margin-top:10px; min-height:100px">
                        Loading...
                    </div>
                </div>
            </div>
        `;
        
        loadRecentBookings();
    }
}

async function loadRecentBookings() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        
        const container = document.getElementById('recentBookings');
        if (data.length === 0) {
            container.innerHTML = '<p>Belum ada booking</p>';
            return;
        }
        
        let html = '<div style="display:grid; gap:10px">';
        data.forEach(booking => {
            html += `
                <div style="padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; border-left:4px solid #D4AF37">
                    <div style="font-weight:bold">${booking.facility}</div>
                    <div style="font-size:0.9rem; color:#a0a0c0">
                        ${booking.date} • ${booking.time} • ${booking.status}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    } catch (err) {
        console.error('Error loading bookings:', err);
        document.getElementById('recentBookings').innerHTML = '<p>Error loading data</p>';
    }
}

window.submitBooking = async function() {
    const facility = document.getElementById('facility').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const purpose = document.getElementById('bookingPurpose').value;
    
    if (!facility || !date || !time) {
        alert('Harap isi fasilitas, tanggal, dan waktu!');
        return;
    }
    
    // Get user info
    const userData = JSON.parse(localStorage.getItem('dream_user')) || { name: 'Guest' };
    
    const bookingData = {
        facility: facility,
        date: date,
        time: time,
        purpose: purpose,
        requester_name: userData.name,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    try {
        // Save to Supabase
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData]);
            
        if (error) throw error;
        
        // Send WhatsApp to Pak Erwin
        const message = `📅 BOOKING BARU\n\nFasilitas: ${facility}\nTanggal: ${date}\nWaktu: ${time}\nPemohon: ${userData.name}\nTujuan: ${purpose || '-'}\nStatus: Menunggu approval`;
        window.open(`https://wa.me/628886183954?text=${encodeURIComponent(message)}`, '_blank');
        
        DREAM.showToast('✅ Booking berhasil diajukan!', 'success');
        
        // Clear form
        document.getElementById('facility').value = '';
        document.getElementById('bookingDate').value = '';
        document.getElementById('bookingTime').value = '';
        document.getElementById('bookingPurpose').value = '';
        
        // Reload recent bookings
        loadRecentBookings();
        
    } catch (error) {
        console.error('Error saving booking:', error);
        DREAM.showToast('❌ Gagal menyimpan booking', 'error');
        
        // Fallback: save to localStorage
        const key = `dream_booking_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(bookingData));
        DREAM.showToast('📱 Disimpan offline', 'info');
    }
};
