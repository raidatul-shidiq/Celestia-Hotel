const loginForm = document.getElementById('login-form');
const customModal = document.getElementById('custom-modal');
const modalOkBtn = document.getElementById('modal-ok-btn');

// Menyimpan data kredensial/akun statis khusus untuk staf (username, password, dan nama staf)
const STAFF_CREDENTIALS = {
    username: "resepsionis",
    password: "celestia2026",
    name: "Resepsionis Utama"
};

// Mengelola proses saat form login dikirim (disubmit) oleh pengguna
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        // Mencegah halaman melakukan refresh bawaan saat form disubmit
        event.preventDefault();

        // Mengambil nilai input username dan password yang dimasukkan, serta membuang spasi berlebih
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        // Mencocokkan input pengguna dengan kredensial staf yang telah ditentukan
        if (usernameInput === STAFF_CREDENTIALS.username && 
            passwordInput === STAFF_CREDENTIALS.password) {
            
            // Menyusun objek data sesi untuk disimpan ke dalam browser
            const sessionData = {
                username: usernameInput,
                name: STAFF_CREDENTIALS.name,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };

            // Menyimpan sesi aktif ke dalam localStorage browser
            localStorage.setItem('celestia_staff_session', JSON.stringify(sessionData));

            // Menampilkan modal kustom sebagai tanda login berhasil
            if (customModal) {
                customModal.classList.add('show-flex-element');
            }
        } else {
            // Menampilkan pesan kesalahan jika username atau password tidak cocok
            showLoginError('Username atau Password salah!');
        }
    });
}

// Fungsi untuk membuat dan menampilkan kotak pesan error saat login gagal
function showLoginError(message) {
    let errorElement = document.getElementById('login-error-message');
    
    // Membuat elemen kotak error baru secara dinamis jika belum ada di halaman
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'login-error-message';
        errorElement.classList.add('login-error-box'); 
        
        if (loginForm) loginForm.appendChild(errorElement);
    }
    
    // Mengisi teks pesan error
    errorElement.textContent = `❌ ${message}`;
    
    // Menghapus elemen pesan error secara otomatis setelah 4 detik
    setTimeout(() => {
        if (errorElement) errorElement.remove();
    }, 4000);
}

// Mengatur tombol "OK" pada modal sukses login untuk menutup modal dan kembali ke halaman utama
if (modalOkBtn) {
    modalOkBtn.addEventListener('click', function() {
        if (customModal) customModal.classList.remove('show-flex-element');
        window.location.href = "../index.html";
    });
}

// Menutup modal sukses login jika pengguna mengeklik area di luar kotak modal
if (customModal) {
    customModal.addEventListener('click', function(event) {
        if (event.target === customModal) {
            customModal.classList.remove('show-flex-element');
        }
    });
}

const togglePasswordBtn = document.getElementById('toggle-password');
const passwordField = document.getElementById('password');

// Mengatur fitur tombol "Show/Hide Password" untuk melihat atau menyembunyikan teks sandi
if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', function() {
        const currentType = passwordField.getAttribute('type');
        const isPassword = currentType === 'password';
        
        // Mengubah tipe input antara 'password' (tersembunyi) dan 'text' (terlihat)
        passwordField.setAttribute('type', isPassword ? 'text' : 'password');
        togglePasswordBtn.textContent = isPassword ? '🔒' : '👁';
        togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Lihat password');
    });

    // Memungkinkan tombol mata bisa diakses dan ditekan menggunakan keyboard (Enter atau Spasi)
    togglePasswordBtn.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.click();
        }
    });
}

// Mengarahkan fokus kursor otomatis ke kolom input username saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    const usernameField = document.getElementById('username');
    if (usernameField) usernameField.focus();
});