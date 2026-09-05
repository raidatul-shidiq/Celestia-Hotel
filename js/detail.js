/* ====================================================
   FETCH DETAIL KAMAR BERDASARKAN ID DI URL
==================================================== */

// Fungsi asinkron untuk mengambil data spesifik suatu kamar berdasarkan parameter ID di URL
const fetchRoomDetail = async () => {
    const container = document.getElementById('room-detail-container');
    
    // Hentikan fungsi jika elemen kontainer detail tidak ditemukan (tidak berada di halaman Detail Kamar)
    if (!container) return;

    // 1. Tangkap parameter ID dari URL (contoh: detailKamar.html?id=1) lalu ubah ke bentuk angka (integer)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = parseInt(urlParams.get('id'));

    // Fungsi pembantu untuk memunculkan teks pesan (seperti loading, error, atau peringatan) ke layar
    const showMessage = (text) => {
        container.replaceChildren(); // Kosongkan isi kontainer sebelumnya
        const msgElement = document.createElement('p');
        msgElement.classList.add('loading-text');
        msgElement.textContent = text;
        container.appendChild(msgElement);
    };

    // Validasi awal: Jika ID tidak ada atau tidak valid, tampilkan pesan peringatan
    if (!roomId) {
        showMessage('ID Kamar tidak ditemukan atau tidak valid.');
        return;
    }

    try {
        // 2. Unduh seluruh data daftar kamar dari API server eksternal
        const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json');
        const roomsData = await response.json();

        // 3. Cari 1 data kamar spesifik di dalam array yang ID-nya cocok dengan parameter ID dari URL
        const room = roomsData.find(item => item.id === roomId);

        // Jika data kamar dengan ID tersebut tidak ditemukan di server, tampilkan pesan error
        if (!room) {
            showMessage('Maaf, data kamar dengan ID tersebut tidak tersedia.');
            return;
        }

        // Hapus teks pesan/loading karena data kamar berhasil ditemukan
        container.replaceChildren();

        // --- Elemen Gambar ---
        // Membuat elemen kontainer dan tag gambar untuk menampilkan foto kamar secara dinamis
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('detail-image-wrapper');
        const img = document.createElement('img');
        img.src = room.image;
        img.alt = room.name;
        img.classList.add('detail-image');
        imgWrapper.appendChild(img);

        // --- Wadah Teks (Judul, Harga, Deskripsi) ---
        // Membuat kontainer teks beserta elemen judul, harga (yang sudah diformat ke Rupiah), dan deskripsi kamar
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('detail-info');

        const title = document.createElement('h2');
        title.textContent = room.name;

        const price = document.createElement('p');
        price.textContent = `Rp ${room.price.toLocaleString('id-ID')} / Malam`;
        price.classList.add('detail-price');

        const desc = document.createElement('p');
        desc.textContent = room.description;
        desc.classList.add('detail-desc');

        // --- Daftar Fasilitas (Bulleted List) ---
        // Membuat elemen daftar berbasis list (<ul> dan <li>) untuk merender fasilitas kamar secara berurutan
        const featuresDiv = document.createElement('div');
        featuresDiv.classList.add('detail-features');
        
        const featureTitle = document.createElement('h4');
        featureTitle.textContent = 'Fasilitas Kamar:';
        
        const ul = document.createElement('ul');
        ul.classList.add('amenities-list');
        for (let i = 0; i < room.amenities.length; i++) {
            const li = document.createElement('li');
            li.textContent = room.amenities[i];
            ul.appendChild(li);
        }
        featuresDiv.appendChild(featureTitle);
        featuresDiv.appendChild(ul);

        // --- Tombol Pesan (Bawa Nama Kamar ke Halaman Home) ---
        // Membuat tombol aksi yang mengarahkan pengguna kembali ke halaman utama (index) sekaligus membawa data nama kamar via URL parameter
        const btnBook = document.createElement('a');
        btnBook.href = `../index.html?room=${encodeURIComponent(room.name)}#booking-form`;
        btnBook.textContent = 'Pesan Kamar Ini';
        btnBook.classList.add('btn-book-now');

        // 4. Gabungkan semua elemen teks, fasilitas, dan tombol pemesanan ke dalam kontainer infoDiv
        infoDiv.append(title, price, desc, featuresDiv, btnBook);

        // 5. Cetak dan tampilkan gambar serta infoDiv secara utuh ke dalam kontainer utama di layar HTML
        container.append(imgWrapper, infoDiv);

    } catch (error) {
        // Tangkap dan cetak error ke konsol jika proses pengambilan data dari server gagal total
        console.error('Gagal memuat detail kamar:', error);
        showMessage('Terjadi kesalahan saat memuat data dari server.');
    }
};

// Trigger Utama: Menjalankan fungsi fetchRoomDetail secara otomatis saat halaman detail kamar selesai dimuat
document.addEventListener('DOMContentLoaded', fetchRoomDetail);