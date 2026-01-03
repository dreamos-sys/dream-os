// DREAM OS - SIMPLE LOADER
console.log('🚀 DREAM OS Starting...');

// Show loading
document.getElementById('loading-overlay').style.display = 'flex';

// Global Config
window.DREAM_CONFIG = {
  VERSION: '1.0.0',
  SUPABASE: {
    URL: 'https://ywtypkgjvbjwhmapmygb.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dHB5a2dqdmJqd2htYXBteWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI5OTcsImV4cCI6MjA4MjQ4ODk5N30.MA78j8WLwOO9nxR36tikN7jBQLjbYWYvTZn___eXBkk'
  }
};

// Initialize Supabase
window.supabase = supabase.createClient(
  DREAM_CONFIG.SUPABASE.URL,
  DREAM_CONFIG.SUPABASE.KEY
);

// Simple Router
function loadModule(module) {
  console.log(`📦 Loading ${module}...`);
  
  const modules = {
    'booking': `
      <div class="module-content">
        <h2>📅 SMART BOOKING</h2>
        <p>Pilih fasilitas dan waktu booking</p>
        <button onclick="alert('Booking system ready!')" 
                style="padding:15px;background:#D4AF37;color:#0a0a2a;border:none;border-radius:10px">
          🚀 Buat Booking
        </button>
      </div>
    `,
    'k3': `
      <div class="module-content">
        <h2>⚠️ LAPORAN K3</h2>
        <p>Kerusakan → Maintenance | Kehilangan → Security | Kebersihan → Cleaning</p>
        <button onclick="alert('K3 system ready!')"
                style="padding:15px;background:#ff4757;color:white;border:none;border-radius:10px">
          📤 Buat Laporan
        </button>
      </div>
    `,
    'security': `
      <div class="module-content">
        <h2>🛡️ SECURITY REPORT</h2>
        <p>Laporan harian security shift</p>
        <button onclick="alert('Security system ready!')"
                style="padding:15px;background:#006B56;color:white;border:none;border-radius:10px">
          📊 Submit Laporan
        </button>
      </div>
    `
  };
  
  document.getElementById('app').innerHTML = modules[module] || '<p>Module not found</p>';
  
  // Hide loading
  document.getElementById('loading-overlay').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM Ready');
  
  // Setup navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const module = this.dataset.module;
      loadModule(module);
    });
  });
  
  // Load default module
  setTimeout(() => {
    loadModule('booking');
    console.log('🎉 DREAM OS Ready!');
  }, 1000);
});

// Error handler
window.addEventListener('error', function(e) {
  console.error('❌ App Error:', e.error);
  document.getElementById('loading-overlay').innerHTML = `
    <div style="text-align:center;color:#ff4757">
      <h2>❌ Error Loading App</h2>
      <p>${e.message}</p>
      <button onclick="location.reload()" 
              style="padding:10px 20px;background:#D4AF37;color:#0a0a2a;border:none;border-radius:5px">
        🔄 Reload
      </button>
    </div>
  `;
});
