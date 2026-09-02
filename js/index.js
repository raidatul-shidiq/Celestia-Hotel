/* ====================================================
   1. Event Handler: Efek Scroll Navbar
==================================================== */
const mainNavbar = document.getElementById('navbar');

// Deteksi saat layar digulir (scroll)
window.addEventListener('scroll', function() {
    // Jika lewat 50px, tambah class 'scrolled' (ubah warna), jika tidak, hapus
    if (window.scrollY > 50) {
        mainNavbar.classList.add('scrolled');
    } else {
        mainNavbar.classList.remove('scrolled');
    }
});

/* ====================================================
   Logika Tombol Header, Dropdown Profil & Mobile Sidebar
==================================================== */
const updateAuthButton = () => {
    // Ambil semua elemen tombol dan dropdown yang dibutuhkan
    const authButton = document.getElementById('auth-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownStaffName = document.getElementById('dropdown-staff-name');
    const btnLogout = document.getElementById('btn-logout');
    const mobileProfileContainer = document.getElementById('mobile-profile-container');

    // Cek apakah ada data sesi staf di penyimpanan lokal (localStorage)
    const staffSession = JSON.parse(localStorage.getItem('celestia_staff_session'));

    // Sesuaikan link login tergantung lokasi user (Folder utama vs Folder HTML)
    const isInHtmlFolder = window.location.pathname.includes('/html/');
    const loginPagePath = isInHtmlFolder ? 'login.html' : 'html/login.html';

    if (staffSession && staffSession.isLoggedIn) {
        // --- JIKA SUDAH LOGIN (DESKTOP) ---
        if (authButton) {
            // Ubah tombol "Login" menjadi "Profil Staf"
            authButton.classList.remove('btn-book');
            authButton.classList.add('btn-staff-profile');
            authButton.textContent = `${staffSession.name} ▼`;
            
            // Tampilkan/sembunyikan dropdown saat ditekan
            authButton.addEventListener('click', function(event) {
                event.stopPropagation();
                if (profileDropdown) profileDropdown.classList.toggle('show');
            });
        }

        // Tulis nama staf di dalam dropdown
        if (dropdownStaffName) dropdownStaffName.textContent = staffSession.name;

        // Fungsi Logout: Hapus sesi dan segarkan layar
        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                localStorage.removeItem('celestia_staff_session');
                window.location.reload();
            });
        }

        // Sembunyikan dropdown jika user mengklik area luar
        window.addEventListener('click', function(event) {
            if (authButton && profileDropdown) {
                if (!authButton.contains(event.target) && !profileDropdown.contains(event.target)) {
                    profileDropdown.classList.remove('show');
                }
            }
        });

        // --- JIKA SUDAH LOGIN (MOBILE) ---
        if (mobileProfileContainer) {
            mobileProfileContainer.classList.add('active-box');
            mobileProfileContainer.replaceChildren();

            // Buat teks judul dan nama secara dinamis pakai DOM
            const titleDiv = document.createElement('div');
            titleDiv.className = 'staff-title';
            titleDiv.textContent = 'Sesi Aktif Staf';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'staff-name-text';
            nameDiv.textContent = `${staffSession.name}`;

            const mobileLogoutBtn = document.createElement('button');
            mobileLogoutBtn.type = 'button';
            mobileLogoutBtn.className = 'btn-mobile-logout';
            mobileLogoutBtn.textContent = 'Keluar (Logout)';

            mobileLogoutBtn.addEventListener('click', function() {
                localStorage.removeItem('celestia_staff_session');
                window.location.reload();
            });

            // Masukkan elemen baru ke dalam container HP
            mobileProfileContainer.appendChild(titleDiv);
            mobileProfileContainer.appendChild(nameDiv);
            mobileProfileContainer.appendChild(mobileLogoutBtn);
        }

    } else {
        // --- JIKA BELUM LOGIN ---
        if (authButton) {
            // Kembalikan ke tombol "Login" biasa
            authButton.classList.add('btn-book');
            authButton.classList.remove('btn-staff-profile');
            authButton.textContent = 'Login';
            if (profileDropdown) profileDropdown.classList.remove('show');
            
            // Arahkan ke halaman login saat diklik
            authButton.addEventListener('click', function() {
                window.location.href = loginPagePath;
            });
        }

        if (mobileProfileContainer) {
            mobileProfileContainer.classList.add('active-box');
            mobileProfileContainer.replaceChildren();

            // Buat tombol login khusus HP
            const loginLink = document.createElement('a');
            loginLink.href = loginPagePath;
            loginLink.className = 'btn-mobile-login';
            loginLink.textContent = 'Login Staf';

            mobileProfileContainer.appendChild(loginLink);
        }
    }
};

/* ====================================================
   DARK / LIGHT MODE TOGGLE
==================================================== */
// Fungsi ini berjalan otomatis (IIFE)
(function() {
    'use strict';
    
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!toggleBtn) return;
    
    // Cek tema terakhir atau deteksi otomatis dari sistem perangkat
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    
    // Terapkan class CSS dan ubah ikon bulan/matahari
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            toggleBtn.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            toggleBtn.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }
    
    // Balikkan tema saat ditekan
    function toggleTheme(e) {
        e.preventDefault();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }
    
    applyTheme(currentTheme);
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Ubah tema web secara real-time jika tema sistem HP/Laptop diubah user
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();

/* ====================================================
   Logika Pembatasan Form Berdasarkan Login
==================================================== */
const checkBookingAccess = () => {
    const bookingForm = document.getElementById('booking-form');
    const bookingAuthWarning = document.getElementById('booking-auth-warning');
    const staffSession = JSON.parse(localStorage.getItem('celestia_staff_session'));
    
    // Cek status validasi sesi
    const isLogged = staffSession && staffSession.isLoggedIn;

    if (!isLogged) {
        // Matikan (disable) semua input form jika belum login
        if (bookingForm) {
            bookingForm.classList.add('locked');
            bookingForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
        }
        // Munculkan teks peringatan
        if (bookingAuthWarning) bookingAuthWarning.style.display = 'block';
    } else {
        // Buka kunci form jika sudah login
        if (bookingForm) {
            bookingForm.classList.remove('locked');
            bookingForm.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
        }
        if (bookingAuthWarning) bookingAuthWarning.style.display = 'none';
    }
};

/* ====================================================
   Toggle Mobile Menu (Hamburger Sidebar)
==================================================== */
const mobileMenuToggle = document.getElementById('mobile-menu');
const navMenu = document.querySelector('header nav');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        // Buka/Tutup sidebar dengan menambah/menghapus class 'active'
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active'); 
    });

    // Tutup sidebar jika layar luar diklik
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active'); 
        }
    });
}

/* ====================================================
   Fetch API: Isi Dropdown Rooms + Filter Stok
==================================================== */
let globalRoomsData = [];

const populateRoomDropdown = async () => {
    const roomSelect = document.getElementById('rooms');
    if (!roomSelect) return;

    try {
        // Ambil data dari Vercel (API) hanya jika data belum ada
        if (globalRoomsData.length === 0) {
            const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json');
            globalRoomsData = await response.json();
        }

        // Ambil riwayat pemesanan untuk menghitung sisa kamar
        const savedBookings = JSON.parse(localStorage.getItem('celestiaBookings')) || [];
        const bookedCountMap = {};

        // Kalkulasi unit yang sudah dipesan per-tipe kamar
        savedBookings.forEach(booking => {
            const qty = parseInt(booking.quantity) || 1;
            bookedCountMap[booking.room] = (bookedCountMap[booking.room] || 0) + qty;
        });

        // Ingat opsi yang sedang dipilih user agar tidak hilang saat di-refresh
        const currentSelectedRoom = roomSelect.value;
        roomSelect.replaceChildren();

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "-- Pilih Kamar --";
        roomSelect.appendChild(defaultOption);

        // Buat <option> baru hanya untuk kamar yang stoknya masih sisa
        globalRoomsData.forEach(room => {
            const currentBooked = bookedCountMap[room.name] || 0;
            const remainingStock = room.totalRooms - currentBooked;

            if (remainingStock > 0) {
                const optionElement = document.createElement('option');
                optionElement.value = room.name;
                optionElement.dataset.maxStock = remainingStock; // Simpan batas unit maksimal
                optionElement.dataset.price = room.price;
                optionElement.textContent = `${room.name} - Rp ${room.price.toLocaleString('id-ID')}`;
                
                if (room.name === currentSelectedRoom) optionElement.selected = true;
                
                roomSelect.appendChild(optionElement);
            }
        });
    } catch (error) {
        console.error('Gagal memuat pilihan kamar dari API:', error);
    }
};

/* ====================================================
   Update Dropdown Jumlah Unit
==================================================== */
const roomSelectElement = document.getElementById('rooms');
const quantitySelectElement = document.getElementById('room-quantity');

// Saat tipe kamar diubah, buat ulang opsi jumlah unit sesuai sisa maxStock
if (roomSelectElement && quantitySelectElement) {
    roomSelectElement.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const maxStock = parseInt(selectedOption.dataset.maxStock) || 1;

        quantitySelectElement.disabled = false;
        quantitySelectElement.replaceChildren();

        for (let i = 1; i <= maxStock; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${String(i).padStart(2, '0')} Unit`;
            quantitySelectElement.appendChild(opt);
        }
    });
}

/* ====================================================
   Validasi Tanggal Minimal (Kalender)
==================================================== */
const setMinDate = () => {
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');

    if (!checkInInput || !checkOutInput) return;

    // Ambil tanggal hari ini format (YYYY-MM-DD)
    const getLocalDateString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Terapkan batas blokir kalender (tidak bisa pilih masa lalu)
    const updateMinDate = () => {
        const todayStr = getLocalDateString();
        checkInInput.min = todayStr;
        checkOutInput.min = checkInInput.value || todayStr;
    };

    updateMinDate();
    
    // Perbarui batas setiap kali user mau nge-klik input
    ['focus', 'click', 'pointerdown', 'mouseenter'].forEach(eventType => {
        checkInInput.addEventListener(eventType, updateMinDate);
        checkOutInput.addEventListener(eventType, updateMinDate);
    });

    // Otomatis samakan kalender Check-out jika check-in digeser
    checkInInput.addEventListener('change', function() {
        checkOutInput.min = checkInInput.value;
        if (checkOutInput.value && checkOutInput.value < checkInInput.value) {
            checkOutInput.value = checkInInput.value;
        }
    });
};

/* ====================================================
   Interaksi Detail UI Pembayaran Modal
==================================================== */
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const cashDetails = document.getElementById('cash-details');
const bniDetails = document.getElementById('bni-details');
const qrisDetails = document.getElementById('qris-details');

if (paymentRadios.length > 0) {
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Sembunyikan semua kotak rincian dulu secara langsung
            if (cashDetails) cashDetails.style.display = 'none';
            if (bniDetails) bniDetails.style.display = 'none';
            if (qrisDetails) qrisDetails.style.display = 'none';

            // Munculkan rincian yang sesuai dengan nilai radio yang dicentang
            if (this.value === 'Uang Tunai (Cash)' && cashDetails) {
                cashDetails.style.display = 'block';
            } else if (this.value === 'Transfer Bank BNI' && bniDetails) {
                bniDetails.style.display = 'block';
            } else if (this.value === 'QRIS / E-Wallet' && qrisDetails) {
                qrisDetails.style.display = 'block';
            }
        });
    });
}

/* ====================================================
   Event Handler Utama: Submit Form Pemesanan
==================================================== */
const reservationForm = document.getElementById('booking-form');
const paymentModal = document.getElementById('payment-modal');
const paymentStep = document.getElementById('payment-step');
const confirmationStep = document.getElementById('confirmation-step');
const receiptStep = document.getElementById('receipt-step');

const btnPay = document.getElementById('btn-pay');
const btnAdminConfirm = document.getElementById('btn-admin-confirm');
const btnPrint = document.getElementById('btn-print');
const btnClose = document.getElementById('btn-close');

const pendingMessage = document.getElementById('pending-message');
const receiptDetails = document.getElementById('receipt-details');

let bookingData = {}; // Objek untuk menyimpan keranjang pesanan

// Format angka ke format mata uang Rupiah
const formatPrice = (price) => `Rp ${price.toLocaleString('id-ID')}`;
const showAlert = (message) => alert(`Peringatan: ${message}`);

if (reservationForm) {
    reservationForm.addEventListener('submit', function(event) {
        // Cegah halaman refresh (perilaku asli form)
        event.preventDefault();

        // Tangkap & bersihkan semua isi form
        const nameInput = document.getElementById('name').value.trim();
        const emailInput = document.getElementById('email').value.trim();
        const phoneInput = document.getElementById('phone').value.trim(); 
        const checkInInput = document.getElementById('check-in').value;
        const checkOutInput = document.getElementById('check-out').value;
        const roomSelectEl = document.getElementById('rooms');
        const quantityInput = parseInt(document.getElementById('room-quantity').value) || 1;
        const guestsInput = document.getElementById('guests').value;
        const childrenInput = document.getElementById('children').value;
        const todayDate = new Date().toISOString().split('T')[0];

        // 3 Validasi Lapis Perlindungan
        if (!nameInput || !emailInput || !phoneInput || !checkInInput || !checkOutInput || !roomSelectEl.value || !guestsInput) {
            showAlert('Harap lengkapi semua data formulir!'); return;
        }
        if (checkInInput < todayDate) {
            showAlert('Tanggal Check-in tidak valid (masa lalu)!'); return;
        }
        if (checkOutInput < checkInInput) {
            showAlert('Tanggal Check-out harus setelah Check-in!'); return;
        }

        // Kalkulasi malam & total harga
        const diffDays = Math.ceil(Math.abs(new Date(checkOutInput) - new Date(checkInInput)) / (1000 * 60 * 60 * 24)) || 1;
        const selectedOption = roomSelectEl.options[roomSelectEl.selectedIndex];
        const totalPrice = (parseFloat(selectedOption.dataset.price) || 0) * quantityInput * diffDays;

        // Susun objek data JSON
        bookingData = {
            name: nameInput, email: emailInput, phone: phoneInput,
            checkIn: checkInInput, checkOut: checkOutInput,
            room: roomSelectEl.value, quantity: quantityInput, nights: diffDays,
            totalPrice: totalPrice, guests: guestsInput, children: childrenInput,
            bookingId: 'CEL-' + String(Math.floor(100000 + Math.random() * 900000)) // Buat Resi Acak
        };

        // Munculkan Modal Pilihan Pembayaran
        if (paymentModal) {
            paymentStep.style.display = 'block';
            if(confirmationStep) confirmationStep.style.display = 'none';
            receiptStep.style.display = 'none';
            paymentModal.style.display = 'flex'; 
        }
    });
}

// Menata dan menampilkan data ke dalam layar struk
const displayReceipt = (data) => {
    if (!receiptDetails) return;
    receiptDetails.replaceChildren();
    
    // Susun array berisi teks struk
    const detailsArray = [
        `ID Pemesanan: ${data.bookingId}`, `Nama Pemesan: ${data.name}`, `Email: ${data.email}`,
        `No HP: ${data.phone}`, `Tipe Kamar: ${data.room}`, `Kamar: ${data.quantity} Unit`,
        `Check In: ${data.checkIn}`, `Check Out: ${data.checkOut} (${data.nights} Malam)`,
        `Total Tamu: ${data.guests} Dewasa, ${data.children} Anak`,
        `Total Harga: ${formatPrice(data.totalPrice)}`, `Metode: ${data.paymentMethod}`,
        `Status: ${data.paymentStatus} ✅`
    ];

    // Cetak array menjadi elemen <p>
    detailsArray.forEach(text => {
        const pElement = document.createElement('p');
        pElement.textContent = text;
        receiptDetails.appendChild(pElement);
    });
};

// Eksekusi Simpan Data ke LocalStorage & Tampilkan Struk Akhir
const finalizePayment = () => {
    bookingData.paymentStatus = 'LUNAS';

    const savedBookings = JSON.parse(localStorage.getItem('celestiaBookings')) || [];
    savedBookings.push(bookingData);
    localStorage.setItem('celestiaBookings', JSON.stringify(savedBookings));

    populateRoomDropdown(); // Refresh sisa stok

    if(paymentStep) paymentStep.style.display = 'none';
    if(confirmationStep) confirmationStep.style.display = 'none';
    if(receiptStep) receiptStep.style.display = 'block';

    displayReceipt(bookingData);
};

// Logika Klik: "Pesan Sekarang" -> Masuk Layar Loading
if (btnPay) {
    btnPay.addEventListener('click', function() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) return showAlert('Pilih metode pembayaran terlebih dahulu!');

        bookingData.paymentMethod = selectedPayment.value;
        bookingData.paymentStatus = 'PENDING';

        if(paymentStep) paymentStep.style.display = 'none';
        if(confirmationStep) confirmationStep.style.display = 'block';

        const isQris = selectedPayment.value.toLowerCase().includes('qris');

        // Jika QRIS: Buat simulasi loading dan tebak otomatis (Sukses 50:50)
        if (isQris) {
            if(pendingMessage) pendingMessage.textContent = "Mendeteksi pembayaran QRIS...";
            setTimeout(() => {
                const isSameNetwork = Math.random() > 0.5; 
                if (isSameNetwork) {
                    alert("✅ Sistem mendeteksi pembayaran. Konfirmasi Otomatis Berhasil!");
                    finalizePayment();
                } else {
                    if(pendingMessage) pendingMessage.textContent = "⚠️ Menunggu staf menekan tombol ACC...";
                }
            }, 2000);
        } else {
            // Jika Cash / BNI langsung tunggu klik manual admin
            if(pendingMessage) pendingMessage.textContent = "Menunggu admin mengecek pembayaran Anda...";
        }
    });
}

// Logika Klik: Tombol ACC Khusus Staf
if (btnAdminConfirm) {
    btnAdminConfirm.addEventListener('click', finalizePayment);
}

// Logika Klik: Cetak (Buka Fitur Print Browser)
if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
}

// Logika Klik: Tutup & Bersihkan Halaman
if (btnClose) {
    btnClose.addEventListener('click', function() {
        paymentModal.style.display = 'none';
        reservationForm.reset();
        populateRoomDropdown();
        
        // Reset state modal agar tampilannya mulai dari awal lagi nanti
        if(paymentStep) paymentStep.style.display = 'block';
        if(confirmationStep) confirmationStep.style.display = 'none';
        if(receiptStep) receiptStep.style.display = 'none';
    });
}

/* ====================================================
   Horizontal Rooms Slider & Navigasi Panah
==================================================== */
// Fungsi pencetak cetakan kartu (DOM Murni)
const createRoomCard = (room) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('room-card');

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('room-image-wrapper');

    const imgElement = document.createElement('img');
    imgElement.src = room.image;
    imgElement.alt = room.name;
    imgElement.classList.add('room-image');
    imageWrapper.appendChild(imgElement);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('room-info');

    const titleElement = document.createElement('h3');
    titleElement.textContent = room.name;

    const priceElement = document.createElement('p');
    priceElement.textContent = `${formatPrice(room.price)} / Malam`;
    priceElement.classList.add('room-price');

    const descElement = document.createElement('p');
    descElement.textContent = room.description;
    descElement.classList.add('room-desc');

    const amenitiesElement = document.createElement('p');
    amenitiesElement.textContent = `Fasilitas: ${room.amenities.join(', ')}`;
    amenitiesElement.classList.add('room-amenities');

    const btnDetail = document.createElement('a');
    btnDetail.href = `html/detailKamar.html?id=${room.id}`;
    btnDetail.textContent = 'Lihat Detail';
    btnDetail.classList.add('btn-room-detail');

    infoDiv.append(titleElement, priceElement, descElement, amenitiesElement, btnDetail);
    cardDiv.append(imageWrapper, infoDiv);

    return cardDiv;
};

// Mengambil Data JSON dari API & Mencetak semua Kartu ke Slider
const fetchHorizontalRooms = async () => {
    const sliderContainer = document.getElementById('horizontal-rooms-container');
    if (!sliderContainer) return;

    try {
        const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json');
        const roomsData = await response.json();

        sliderContainer.replaceChildren();
        roomsData.forEach(room => sliderContainer.appendChild(createRoomCard(room)));

        setupSliderNavigation();
    } catch (error) {
        console.error('Gagal memuat slider kamar:', error);
    }
};

// Mengaktifkan Tombol Kanan-Kiri Slider
const setupSliderNavigation = () => {
    const sliderContainer = document.getElementById('horizontal-rooms-container');
    let btnLeft = document.getElementById('slide-left');
    let btnRight = document.getElementById('slide-right');

    if (!sliderContainer || !btnLeft || !btnRight) return;

    // Hitung perkiraan jarak geser berdasarkan ukuran kartu
    const getScrollAmount = () => {
        const firstCard = sliderContainer.querySelector('.room-card');
        return firstCard ? (firstCard.offsetWidth + 30) * 3 : 300;
    };

    const scrollLeft = () => sliderContainer.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    const scrollRight = () => sliderContainer.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });

    // Hapus Event Listener usang dgn teknik cloneNode agar tidak terjadi penumpukan/error memori
    const newBtnLeft = btnLeft.cloneNode(true);
    const newBtnRight = btnRight.cloneNode(true);
    btnLeft.parentNode.replaceChild(newBtnLeft, btnLeft);
    btnRight.parentNode.replaceChild(newBtnRight, btnRight);

    document.getElementById('slide-left').addEventListener('click', scrollLeft);
    document.getElementById('slide-right').addEventListener('click', scrollRight);
};

/* ====================================================
   INITIALIZATION
==================================================== */
// Trigger Utama: Panggil seluruh fungsi di atas hanya setelah HTML & CSS siap 100%
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    checkBookingAccess();
    setMinDate();
    fetchHorizontalRooms();
    populateRoomDropdown(); 
});