/* ====================================================
   Logika Form Login Staf & Modal Pop-up Kustom
==================================================== */
const loginForm = document.getElementById('login-form');
const customModal = document.getElementById('custom-modal');
const modalOkBtn = document.getElementById('modal-ok-btn');

// Data kredensial statis (dummy) untuk simulasi login staf
const STAFF_CREDENTIALS = {
    username: "resepsionis",
    password: "celestia2026",
    name: "Resepsionis Utama"
};

// Event saat tombol "Login" ditekan
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Cegah halaman refresh

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        // Cek kecocokan input dengan data kredensial
        if (usernameInput === STAFF_CREDENTIALS.username && 
            passwordInput === STAFF_CREDENTIALS.password) {
            
            // Susun data sesi jika login berhasil
            const sessionData = {
                username: usernameInput,
                name: STAFF_CREDENTIALS.name,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };

            // Simpan data login ke memori browser (localStorage)
            localStorage.setItem('celestia_staff_session', JSON.stringify(sessionData));

            // Munculkan Pop-up Modal Sukses
            if (customModal) {
                customModal.classList.add('show-flex-element');
            }
        } else {
            // Panggil fungsi error jika username/password salah
            showLoginError('Username atau Password salah!');
        }
    });
}

// Fungsi memunculkan peringatan error berwarna merah (DOM murni tanpa inline CSS)
function showLoginError(message) {
    let errorElement = document.getElementById('login-error-message');
    
    // Jika belum ada pesannya, buat elemen baru
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'login-error-message';
        // Tambahkan class murni dari CSS eksternal (Tidak pakai style.cssText)
        errorElement.classList.add('login-error-box'); 
        
        if (loginForm) loginForm.appendChild(errorElement);
    }
    
    errorElement.textContent = `❌ ${message}`;
    
    // Hapus pesan error secara otomatis setelah 4 detik
    setTimeout(() => {
        if (errorElement) errorElement.remove();
    }, 4000);
}

// Logika Tombol OK pada Pop-up Sukses: Arahkan ke halaman Home
if (modalOkBtn) {
    modalOkBtn.addEventListener('click', function() {
        if (customModal) customModal.classList.remove('show-flex-element');
        window.location.href = "../index.html";
    });
}

// Tutup pop-up jika user mengklik area gelap di luar kotak modal
if (customModal) {
    customModal.addEventListener('click', function(event) {
        if (event.target === customModal) {
            customModal.classList.remove('show-flex-element');
        }
    });
}

/* ====================================================
   Logika Tombol Toggle Lihat / Sembunyikan Password
==================================================== */
// Mengubah tipe input antara 'password' (titik-titik) dan 'text' (terlihat)
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordField = document.getElementById('password');

if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', function() {
        const currentType = passwordField.getAttribute('type');
        const isPassword = currentType === 'password';
        
        passwordField.setAttribute('type', isPassword ? 'text' : 'password');
        togglePasswordBtn.textContent = isPassword ? '🔒' : '👁';
        togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Lihat password');
    });

    // Dukungan aksesibilitas agar bisa menggunakan tombol Enter/Spasi
    togglePasswordBtn.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.click();
        }
    });
}

/* ====================================================
   Auto-focus pada input username saat halaman dimuat
==================================================== */
// Mengarahkan kursor langsung ke kolom username begitu web dibuka
document.addEventListener('DOMContentLoaded', function() {
    const usernameField = document.getElementById('username');
    if (usernameField) usernameField.focus();
});

/* ====================================================
   Clear session jika ada parameter logout
==================================================== */
// Hapus data login dari memori jika URL memiliki "?logout=true"
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('logout') === 'true') {
    localStorage.removeItem('celestia_staff_session');
}

/* ====================================================
   Cek session aktif - redirect jika sudah login
==================================================== */
// Cegah staf yang sudah login mengakses halaman login lagi
(function() {
    const staffSession = JSON.parse(localStorage.getItem('celestia_staff_session'));
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (staffSession && staffSession.isLoggedIn && isLoginPage) {
        // Otomatis tendang kembali ke Home
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        const redirectPath = isInHtmlFolder ? '../index.html' : 'index.html';
        window.location.href = redirectPath;
    }
})();