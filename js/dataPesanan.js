document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. INISIALISASI VARIABEL & ELEMEN DOM
    // ==========================================
    const bookingsContainer = document.getElementById('bookingsContainer');
    const searchInput = document.getElementById('searchInput');
    const noDataTemplate = document.getElementById('no-data-template');
    const cardTemplate = document.getElementById('booking-card-template');

    // Variabel Modal Hapus & Check-out
    const modal = document.getElementById('deleteModal');
    const btnModalCancel = document.getElementById('btnModalCancel');
    const btnModalConfirm = document.getElementById('btnModalConfirm');

    // Variabel Modal Perpanjang Kamar
    const extendModal = document.getElementById('extendModal');
    const btnExtendCancel = document.getElementById('btnExtendCancel');
    const btnExtendConfirm = document.getElementById('btnExtendConfirm');
    const newCheckOutInput = document.getElementById('newCheckOutDate');

    // Variabel Modal Sukses (Pengganti Alert)
    const successModal = document.getElementById('successModal');
    const successModalTitle = document.getElementById('successModalTitle');
    const successModalMessage = document.getElementById('successModalMessage');
    const btnSuccessClose = document.getElementById('btnSuccessClose');

    // Ambil data pesanan dari LocalStorage
    let bookingsData = JSON.parse(localStorage.getItem('celestiaBookings')) || [];
    let idToDelete = null; // Menyimpan ID pesanan yang akan dihapus
    let idToExtend = null; // Menyimpan ID pesanan yang akan diperpanjang

    // Variabel Form Pelunasan Check-out (Metode Pembayaran)
    const settlementRadios = document.querySelectorAll('input[name="settlementPayment"]');
    const checkoutCashDetails = document.getElementById('checkout-cash-details');
    const checkoutBniDetails = document.getElementById('checkout-bni-details');
    const checkoutQrisDetails = document.getElementById('checkout-qris-details');

    // ==========================================
    // 2. LOGIKA TAMPILAN METODE PEMBAYARAN
    // ==========================================
    // Menampilkan kotak instruksi (Cash/BNI/QRIS) sesuai pilihan Radio Button
    if (settlementRadios.length > 0) {
        settlementRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                // Sembunyikan semua kotak detail terlebih dahulu
                if (checkoutCashDetails) {
                    checkoutCashDetails.classList.add('hidden-element');
                    checkoutCashDetails.classList.remove('show-block-element');
                }
                if (checkoutBniDetails) {
                    checkoutBniDetails.classList.add('hidden-element');
                    checkoutBniDetails.classList.remove('show-block-element');
                }
                if (checkoutQrisDetails) {
                    checkoutQrisDetails.classList.add('hidden-element');
                    checkoutQrisDetails.classList.remove('show-block-element');
                }

                // Tampilkan hanya kotak yang sesuai dengan pilihan
                if (this.value === 'Uang Tunai (Cash)' && checkoutCashDetails) {
                    checkoutCashDetails.classList.remove('hidden-element');
                    checkoutCashDetails.classList.add('show-block-element');
                } else if (this.value === 'Transfer Bank BNI' && checkoutBniDetails) {
                    checkoutBniDetails.classList.remove('hidden-element');
                    checkoutBniDetails.classList.add('show-block-element');
                } else if (this.value === 'QRIS / E-Wallet' && checkoutQrisDetails) {
                    checkoutQrisDetails.classList.remove('hidden-element');
                    checkoutQrisDetails.classList.add('show-block-element');
                }
            });
        });
    }

    // ==========================================
    // 3. FUNGSI RENDER (MENCETAK KARTU DATA)
    // ==========================================
    const renderBookings = (data) => {
        bookingsContainer.replaceChildren(); // Kosongkan layar sebelum mencetak ulang

        // Jika data kosong, tampilkan pesan template "Tidak ada data"
        if (data.length === 0) {
            const noDataClone = noDataTemplate.content.cloneNode(true);
            bookingsContainer.appendChild(noDataClone);
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        // Balik urutan array agar data terbaru muncul paling atas, lalu cetak satu per satu
        data.slice().reverse().forEach(booking => {
            const clone = cardTemplate.content.cloneNode(true); // Gandakan kerangka kartu

            // Isi teks pada elemen-elemen kerangka kartu
            clone.querySelector('.booking-name').textContent = booking.name;
            clone.querySelector('.booking-id').textContent = `ID: ${booking.bookingId}`;
            clone.querySelector('.booking-phone').textContent = booking.phone || '-';
            clone.querySelector('.booking-room').textContent = `${booking.room} (${booking.quantity} Unit)`;
            clone.querySelector('.booking-schedule').textContent = `${booking.checkIn} s/d ${booking.checkOut}`;

            const formattedPrice = booking.totalPrice ? `Rp ${booking.totalPrice.toLocaleString('id-ID')}` : '-';
            clone.querySelector('.booking-total').textContent = formattedPrice;

            // Logika Sisa Tagihan & Penentuan Warna Badge Status
            const unpaidWrapper = clone.querySelector('.unpaid-wrapper');
            const unpaidAmount = booking.unpaidAmount || 0;
            const badgeStatus = clone.querySelector('.badge-status');

            badgeStatus.className = 'badge-status'; // Reset class badge

            if (unpaidAmount > 0) {
                // Jika punya utang (habis perpanjang)
                unpaidWrapper.classList.remove('hidden-element');
                unpaidWrapper.classList.add('show-flex-element');
                clone.querySelector('.booking-unpaid').textContent = `Rp ${unpaidAmount.toLocaleString('id-ID')}`;

                badgeStatus.textContent = 'BELUM LUNAS ⚠️';
                badgeStatus.classList.add('badge-unpaid');
            } else {
                // Jika sudah lunas
                unpaidWrapper.classList.add('hidden-element');
                unpaidWrapper.classList.remove('show-flex-element');

                // Tentukan status badge berdasarkan tanggal
                if (booking.paymentStatus === 'DIPERPANJANG ✅') {
                    badgeStatus.textContent = 'DIPERPANJANG ✅';
                    badgeStatus.classList.add('badge-extended');
                } else if (booking.checkOut < today) {
                    badgeStatus.textContent = 'TERLEWAT / OVERSTAY ⚠️';
                    badgeStatus.classList.add('badge-overstay');
                } else if (booking.checkOut === today) {
                    badgeStatus.textContent = 'WAKTUNYA CHECK-OUT ⏳';
                    badgeStatus.classList.add('badge-checkout');
                } else {
                    badgeStatus.textContent = 'LUNAS (IN-HOUSE) ✅';
                    badgeStatus.classList.add('badge-lunas');
                }
            }

            // === A. Logika Tombol Check-out (Hapus) pada Kartu ===
            const btnDelete = clone.querySelector('.btn-delete');
            btnDelete.addEventListener('click', () => {
                idToDelete = booking.bookingId;

                const checkoutWarning = document.getElementById('checkoutBillWarning');
                const checkoutAmountText = document.getElementById('checkoutUnpaidAmount');

                // Jika ada sisa tagihan, ubah modal jadi mode "Pelunasan"
                if (unpaidAmount > 0) {
                    checkoutWarning.classList.remove('hidden-element');
                    checkoutWarning.classList.add('show-flex-element');
                    checkoutAmountText.textContent = `Rp ${unpaidAmount.toLocaleString('id-ID')}`;

                    btnModalConfirm.textContent = 'Terima Uang & Check-out';
                    btnModalConfirm.classList.add('btn-success-green');
                } else {
                    // Jika lunas, modal konfirmasi hapus normal
                    checkoutWarning.classList.add('hidden-element');
                    checkoutWarning.classList.remove('show-flex-element');

                    btnModalConfirm.textContent = 'Ya, Hapus Data';
                    btnModalConfirm.classList.remove('btn-success-green');
                }

                modal.classList.remove('hidden-element');
                modal.classList.add('show-flex-element');
            });

            // === B. Logika Tombol Perpanjang pada Kartu ===
            const btnExtend = clone.querySelector('.btn-extend');
            btnExtend.addEventListener('click', () => {
                idToExtend = booking.bookingId;

                // Set batas minimal kalender ke besoknya dari tanggal check-out lama
                const currentCheckOut = new Date(booking.checkOut);
                currentCheckOut.setDate(currentCheckOut.getDate() + 1);
                const minExtendStr = currentCheckOut.toISOString().split('T')[0];

                newCheckOutInput.min = minExtendStr;
                newCheckOutInput.value = minExtendStr;

                extendModal.classList.remove('hidden-element');
                extendModal.classList.add('show-flex-element');
            });

            // Cetak kartu jadi ke dalam kontainer HTML
            bookingsContainer.appendChild(clone);
        });
    };

    renderBookings(bookingsData);

    // ==========================================
    // 4. LOGIKA PENCARIAN REAL-TIME (FILTER)
    // ==========================================
    searchInput.addEventListener('input', (event) => {
        const kataKunci = event.target.value.toLowerCase();
        // Saring array data berdasarkan kecocokan nama atau no HP
        const dataTersaring = bookingsData.filter(booking => {
            const namaCocok = booking.name && booking.name.toLowerCase().includes(kataKunci);
            const hpCocok = booking.phone && booking.phone.includes(kataKunci);
            return namaCocok || hpCocok;
        });
        renderBookings(dataTersaring);
    });

    // ==========================================
    // 5. EVENT LISTENER: MODAL HAPUS & PELUNASAN
    // ==========================================
    const closeModal = () => {
        idToDelete = null;
        modal.classList.add('hidden-element');
        modal.classList.remove('show-flex-element');
    };

    btnModalCancel.addEventListener('click', closeModal);

    btnModalConfirm.addEventListener('click', () => {
        if (idToDelete) {
            const checkoutWarning = document.getElementById('checkoutBillWarning');
            const isSettlement = checkoutWarning.classList.contains('show-flex-element');

            // Set pesan di dalam modal sukses
            if (isSettlement) {
                const checkedPayment = document.querySelector('input[name="settlementPayment"]:checked');
                const method = checkedPayment ? checkedPayment.value : 'Uang Tunai (Cash)';
                const amount = document.getElementById('checkoutUnpaidAmount').textContent;
                
                successModalTitle.textContent = 'Pelunasan Berhasil!';
                successModalMessage.textContent = `Uang sebesar ${amount} telah diterima melalui ${method}.\n\nTamu resmi Check-out dan data pesanan telah dihapus.`;
            } else {
                successModalTitle.textContent = 'Check-out Berhasil!';
                successModalMessage.textContent = 'Tamu resmi Check-out dan data berhasil dihapus dari sistem.';
            }

            // Hapus pesanan dari array dan simpan ke LocalStorage
            bookingsData = bookingsData.filter(booking => booking.bookingId !== idToDelete);
            localStorage.setItem('celestiaBookings', JSON.stringify(bookingsData));

            // Pertahankan pencarian saat ini sebelum mencetak ulang
            const kataKunci = searchInput.value.toLowerCase();
            const dataTersaring = bookingsData.filter(booking => {
                const namaCocok = booking.name && booking.name.toLowerCase().includes(kataKunci);
                const hpCocok = booking.phone && booking.phone.includes(kataKunci);
                return namaCocok || hpCocok;
            });

            renderBookings(dataTersaring);
            closeModal();

            // Tampilkan popup sukses
            successModal.classList.remove('hidden-element');
            successModal.classList.add('show-flex-element');
        }
    });

    // ==========================================
    // 6. EVENT LISTENER: MODAL PERPANJANG
    // ==========================================
    const closeExtendModal = () => {
        idToExtend = null;
        extendModal.classList.add('hidden-element');
        extendModal.classList.remove('show-flex-element');
    };

    btnExtendCancel.addEventListener('click', closeExtendModal);

    btnExtendConfirm.addEventListener('click', () => {
        // Validasi input tanggal baru
        if (!newCheckOutInput.value) {
            successModalTitle.textContent = 'Peringatan';
            successModalMessage.textContent = 'Pilih tanggal check-out baru terlebih dahulu!';
            successModal.classList.remove('hidden-element');
            successModal.classList.add('show-flex-element');
            return;
        }

        const bookingIndex = bookingsData.findIndex(b => b.bookingId === idToExtend);
        if (bookingIndex !== -1) {
            const booking = bookingsData[bookingIndex];

            // Cegah user memundurkan tanggal perpanjangan
            if (newCheckOutInput.value <= booking.checkOut) {
                successModalTitle.textContent = 'Peringatan';
                successModalMessage.textContent = 'Tanggal perpanjangan harus lebih lama dari tanggal check-out sebelumnya!';
                successModal.classList.remove('hidden-element');
                successModal.classList.add('show-flex-element');
                return;
            }

            // Hitung durasi malam baru
            const date1 = new Date(booking.checkIn);
            const date2 = new Date(newCheckOutInput.value);
            const diffTime = Math.abs(date2 - date1);
            const newNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Hitung harga tambahan yang harus dilunasi nanti
            const pricePerNightAndRooms = booking.totalPrice / booking.nights;
            const newTotalPrice = pricePerNightAndRooms * newNights;
            const addedPrice = newTotalPrice - booking.totalPrice;

            // Simpan perubahan ke objek pesanan
            bookingsData[bookingIndex].checkOut = newCheckOutInput.value;
            bookingsData[bookingIndex].nights = newNights;
            bookingsData[bookingIndex].totalPrice = newTotalPrice;
            bookingsData[bookingIndex].unpaidAmount = (booking.unpaidAmount || 0) + addedPrice;

            localStorage.setItem('celestiaBookings', JSON.stringify(bookingsData));

            // Refresh layar agar kartu menampilkan sisa tagihan
            const kataKunci = searchInput.value.toLowerCase();
            const dataTersaring = bookingsData.filter(b => {
                const namaCocok = b.name && b.name.toLowerCase().includes(kataKunci);
                const hpCocok = b.phone && b.phone.includes(kataKunci);
                return namaCocok || hpCocok;
            });

            renderBookings(dataTersaring);
            closeExtendModal();
            
            // Tampilkan popup sukses perpanjang
            successModalTitle.textContent = 'Perpanjangan Berhasil!';
            successModalMessage.textContent = 'Kamar diperpanjang!\nSisa tagihan telah ditambahkan dan wajib dilunasi saat check-out.';
            successModal.classList.remove('hidden-element');
            successModal.classList.add('show-flex-element');
        }
    });

    // ==========================================
    // 7. EVENT LISTENER: TUTUP MODAL SUKSES & KLIK LUAR
    // ==========================================
    const closeSuccessModal = () => {
        successModal.classList.add('hidden-element');
        successModal.classList.remove('show-flex-element');
    };

    btnSuccessClose.addEventListener('click', closeSuccessModal);

    // Jika user mengklik latar belakang hitam transparan, tutup modal yang aktif
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
        if (event.target === extendModal) closeExtendModal();
        if (event.target === successModal) closeSuccessModal(); 
    });

    // ==========================================
    // 8. TEMA DARK MODE (Sinkronisasi Antar Halaman)
    // ==========================================
    // Cek apakah user sedang mengaktifkan mode gelap di halaman utama
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});