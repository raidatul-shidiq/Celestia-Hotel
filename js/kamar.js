/* ====================================================
   FETCH API & MANIPULASI DOM (Membuat Kartu Kamar)
==================================================== */

// Fungsi asinkron untuk mengambil data kamar dari server dan merender kartu kamar secara dinamis
const fetchHotelRooms = async () => {
    const roomsContainer = document.getElementById('rooms-container');
    
    // Hentikan eksekusi jika tidak sedang berada di halaman Kamar (elemen tidak ditemukan)
    if (!roomsContainer) return; 

    try {
        // 1. Unduh data berformat JSON dari server API eksternal
        const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json'); 
        const roomsData = await response.json();

        // 2. Lakukan perulangan (loop) untuk mencetak setiap kartu kamar berdasarkan data yang didapat
        for (let i = 0; i < roomsData.length; i++) {
            const room = roomsData[i]; 

            // Buat kerangka elemen HTML utama kartu menggunakan DOM (Tanpa innerHTML demi keamanan)
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('room-card');

            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('room-image-wrapper');

            // Masukkan data gambar kamar (sumber dan teks alternatif)
            const imgElement = document.createElement('img');
            imgElement.src = room.image;
            imgElement.alt = room.name;
            imgElement.classList.add('room-image');
            imageWrapper.appendChild(imgElement);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('room-info');

            // Masukkan data teks informasi (Judul nama kamar, Harga yang diformat, Deskripsi, dan Fasilitas)
            const titleElement = document.createElement('h3');
            titleElement.textContent = room.name;

            const priceElement = document.createElement('p');
            priceElement.textContent = `Rp ${room.price.toLocaleString('id-ID')} / Malam`;
            priceElement.classList.add('room-price');

            const descElement = document.createElement('p');
            descElement.textContent = room.description;
            descElement.classList.add('room-desc');

            const amenitiesElement = document.createElement('p');
            amenitiesElement.textContent = `Fasilitas: ${room.amenities.join(', ')}`;
            amenitiesElement.classList.add('room-amenities');

            // Buat tombol navigasi dengan URL dinamis yang membawa parameter ID Kamar spesifik
            const btnDetail = document.createElement('a');
            btnDetail.href = `detailKamar.html?id=${room.id}`; 
            btnDetail.textContent = 'Detail Kamar';
            btnDetail.classList.add('btn-room-detail');

            // 3. Susun dan gabungkan semua elemen teks serta tombol ke dalam kontainer informasi (infoDiv)
            infoDiv.append(titleElement, priceElement, descElement, amenitiesElement, btnDetail);

            // 4. Gabungkan pembungkus gambar dan infoDiv ke dalam kartu utama kamar
            cardDiv.append(imageWrapper, infoDiv);

            // 5. Cetak dan tampilkan kartu kamar yang sudah jadi ke dalam elemen kontainer di halaman web
            roomsContainer.appendChild(cardDiv);
        }
    } catch (error) {
        // Tangkap dan tampilkan pesan error di konsol jika pengambilan data API gagal
        console.error('Terjadi kesalahan memuat data kamar API:', error);
    }
};

// Trigger Utama: Menjalankan fungsi fetchHotelRooms secara otomatis tepat setelah struktur HTML selesai dimuat
document.addEventListener('DOMContentLoaded', fetchHotelRooms);