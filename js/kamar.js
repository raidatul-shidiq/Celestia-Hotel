/* ====================================================
   FETCH API & MANIPULASI DOM (Membuat Kartu Kamar)
==================================================== */

const fetchHotelRooms = async () => {
    const roomsContainer = document.getElementById('rooms-container');
    
    // Hentikan eksekusi jika tidak sedang berada di halaman Kamar
    if (!roomsContainer) return; 

    try {
        // 1. Unduh data berformat JSON dari server API
        const response = await fetch('https://hotel-api-theta-two.vercel.app/data.json'); 
        const roomsData = await response.json();

        // 2. Lakukan perulangan untuk mencetak setiap kartu kamar
        for (let i = 0; i < roomsData.length; i++) {
            const room = roomsData[i]; 

            // Buat kerangka utama kartu (Tanpa innerHTML)
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('room-card');

            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('room-image-wrapper');

            // Masukkan data gambar
            const imgElement = document.createElement('img');
            imgElement.src = room.image;
            imgElement.alt = room.name;
            imgElement.classList.add('room-image');
            imageWrapper.appendChild(imgElement);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('room-info');

            // Masukkan data teks (Judul, Harga, Deskripsi, Fasilitas)
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

            // Buat tombol dengan URL dinamis (Membawa ID Kamar)
            const btnDetail = document.createElement('a');
            btnDetail.href = `detailKamar.html?id=${room.id}`; 
            btnDetail.textContent = 'Detail Kamar';
            btnDetail.classList.add('btn-room-detail');

            // 3. Susun semua teks dan tombol ke dalam infoDiv
            infoDiv.append(titleElement, priceElement, descElement, amenitiesElement, btnDetail);

            // 4. Gabungkan gambar dan infoDiv ke dalam kartu utama
            cardDiv.append(imageWrapper, infoDiv);

            // 5. Cetak kartu yang sudah jadi ke layar
            roomsContainer.appendChild(cardDiv);
        }
    } catch (error) {
        console.error('Terjadi kesalahan memuat data kamar API:', error);
    }
};

// Jalankan fungsi secara otomatis saat HTML selesai dimuat
document.addEventListener('DOMContentLoaded', fetchHotelRooms);