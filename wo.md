Konteks:
Ini adalah aplikasi Wedding Organizer Management System.
Program ini bukan hanya CRUD data, tapi sistem operasional WO dari awal client masuk sampai event selesai dan laporan keluar.

Tujuan utama aplikasi:
1. Membantu client memilih kebutuhan pernikahan dengan jelas.
2. Membantu WO mengelola paket, vendor, tim, pembayaran, dan event.
3. Mengurangi miskomunikasi antara client, staff WO, vendor, dan tim lapangan.
4. Mencegah vendor double booking.
5. Menyimpan semua preferensi client seperti baju, dekorasi, makeup, adat, warna, dan referensi gambar.
6. Menghasilkan laporan event, pembayaran, dan keuangan.

Alur utama aplikasi:
Client masuk / dibuat oleh staff
→ pilih tanggal acara
→ pilih adat / konsep pernikahan
→ pilih paket
→ lihat detail paket
→ pilih vendor yang tersedia sesuai paket dan tanggal
→ upload referensi client jika punya
→ staff WO review dan approve
→ sistem membuat booking event
→ sistem membuat checklist, timeline, tim WO, dan pembayaran
→ event dimonitor sampai selesai
→ laporan bisa dicetak/export.

Konsep penting:
1. Paket bukan hanya nama dan harga.
   Paket harus berisi fasilitas, kategori vendor, dan vendor yang boleh dipilih.
   Contoh Paket Gold:
   - Musik: Band A, Band B
   - Dekorasi: Dekor A, Dekor B
   - Makeup: MUA A, MUA B

2. Vendor yang muncul saat booking bukan semua vendor.
   Vendor yang muncul harus memenuhi 3 kondisi:
   - masuk ke paket yang dipilih
   - sesuai kategori
   - tersedia di tanggal acara

3. Client boleh memilih preferensi vendor, baju, dekorasi, makeup, dan adat.
   Tapi staff WO tetap bisa melakukan approval/finalisasi.

4. Client bisa upload gambar referensi sendiri.
   Referensi ini bisa untuk:
   - model baju
   - warna baju
   - dekorasi
   - makeup
   - aksesori
   - konsep acara

5. Sistem harus menjaga detail keinginan client.
   Semua catatan, wishlist, request, dan referensi harus tersimpan berdasarkan kode booking agar tidak miskomunikasi.

6. Tim WO harus bisa dibagi per event.
   Setiap crew punya role, jadwal, lokasi tugas, dan status hadir.

7. Harus ada checklist barang/aksesori.
   Tujuannya agar tim tidak salah bawa barang seperti baju, siger, aksesori, sepatu, hand bouquet, dan perlengkapan lainnya.

8. Keuangan harus terhubung dengan booking.
   Setiap pembayaran client harus tercatat dan otomatis masuk ke transaksi keuangan sebagai pemasukan.
   Setiap pengeluaran vendor/operasional masuk sebagai pengeluaran.

9. Laporan harus bisa export Excel dan PDF.

Role pengguna:
- Admin/Owner: akses semua data, laporan, keuangan
- Staff WO: kelola client, booking, timeline, checklist, tim
- Finance: kelola pembayaran dan keuangan
- Client: lihat paket, pilih preferensi, upload referensi, lihat progress
- Vendor: lihat jadwal/job yang diberikan

Prinsip UI:
- Semua data master dan transaksi tampil dalam table view.
- Jangan gunakan card untuk list data utama.
- Gunakan custom confirmation dialog, bukan browser alert.
- Semua form harus punya validasi.
- Dropdown harus ambil dari master data.
- Ada tombol view detail/icon mata untuk melihat detail paket, booking, client, dan vendor.
- Format uang harus rapi.
- UX harus simple, cepat, dan mudah dipahami staff WO.

Output akhir yang diharapkan:
Aplikasi ini harus terasa seperti sistem kerja WO sungguhan, bukan hanya kumpulan form.
Setiap data harus saling terhubung:
Master Vendor → Paket → Booking → Vendor Availability → Preferensi Client → Timeline → Tim WO → Pembayaran → Keuangan → Laporan.

Jangan hanya membuat halaman input.
Pastikan flow bisnis Wedding Organizer berjalan dari awal sampai akhir.