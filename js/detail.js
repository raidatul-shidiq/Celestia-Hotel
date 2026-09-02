/* ====================================================
   FETCH DETAIL KAMAR BERDASARKAN ID DI URL
==================================================== */
const fetchRoomDetail = async () => {
    const container = document.getElementById('room-detail-container');
    
    // Hentikan fungsi jika tidak berada di halaman Detail Kamar
    if (!container) return;

    // 1. Tangkap parameter ID dari URL (contoh: detailKamar.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = parseInt(urlParams.get('id'));

    // Fungsi pembantu untuk memunculkan teks pesan (loading/error) ke layar
    const showMessage = (text) => {
        container.replaceChildren(); // Kosongkan isi sebelumnya
        const msgElement = document.createElement('p');
        msgElement.classList.add('loading-text');
        msgElement.textContent = text;
        container.appendChild(msgElement);
    };

    if (!roomId) {
        showMessage('ID Kamar tidak ditemukan atau tidak valid.');
        return;
    }

    try {
        // 2. Unduh semua data kamar dari API
        const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json');
        const roomsData = await response.json();

        // 3. Cari 1 kamar spesifik yang ID-nya cocok dengan URL
        const room = roomsData.find(item => item.id === roomId);

        if (!room) {
            showMessage('Maaf, data kamar dengan ID tersebut tidak tersedia.');
            return;
        }

        // Hapus teks loading karena data berhasil ditemukan
        container.replaceChildren();

        // --- Elemen Gambar ---
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('detail-image-wrapper');
        const img = document.createElement('img');
        img.src = room.image;
        img.alt = room.name;
        img.classList.add('detail-image');
        imgWrapper.appendChild(img);

        // --- Wadah Teks (Judul, Harga, Deskripsi) ---
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
        const btnBook = document.createElement('a');
        btnBook.href = `../index.html?room=${encodeURIComponent(room.name)}#booking-form`;
        btnBook.textContent = 'Pesan Kamar Ini';
        btnBook.classList.add('btn-book-now');

        // 4. Gabungkan semua elemen teks ke dalam infoDiv
        infoDiv.append(title, price, desc, featuresDiv, btnBook);

        // 5. Cetak gambar dan infoDiv ke layar (wadah utama HTML)
        container.append(imgWrapper, infoDiv);

    } catch (error) {
        console.error('Gagal memuat detail kamar:', error);
        showMessage('Terjadi kesalahan saat memuat data dari server.');
    }
};

// Jalankan otomatis saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchRoomDetail);