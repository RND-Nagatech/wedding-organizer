Konteks:
Aplikasi Wedding Organizer Management System.
Saya ingin sistem ini bukan hanya CRUD, tapi sistem kerja WO lengkap dari client masuk sampai event selesai.

Tolong sesuaikan arah aplikasi dengan konsep berikut.

1. Admin Panel
Fokus admin adalah management, monitoring, dan approval.

Menu utama admin:
- Dashboard
- Project Management
- Master Data
- Resource Management
- Keuangan
- Laporan
- User Management

Dashboard admin harus menampilkan:
- total project berjalan
- event terdekat
- pembayaran jatuh tempo
- task overdue
- vendor/crew conflict
- calendar event

Project Management:
- list active weddings
- detail project per kode booking
- tab detail project:
  1. Timeline WO / checklist internal
  2. Client preference
  3. Vendor picked / vendor final
  4. Crew assignment
  5. Checklist barang / aset
  6. Payment tracker
  7. Digital form client
  8. Documents

2. Client Panel
Fokus client adalah transparency dan interaction.

Menu client:
- Home
- My Planning
- My Preferences
- Digital Form
- Budget & Payment
- My Guests

Home client:
- countdown hari-H
- progress bar persiapan
- status booking
- shortcut WhatsApp admin

My Planning:
- timeline sederhana untuk client
- task yang perlu dilakukan client
- client bisa upload bukti/dokumen jika diperlukan

My Preferences:
Client bisa memilih atau upload referensi untuk:
- baju
- dekorasi
- makeup
- adat/konsep
- warna tema
- aksesori

Digital Form:
Client mengisi data penting acara:
- nama pengantin
- nama orang tua
- wali
- saksi
- MC
- penghulu/pemuka agama
- lokasi akad
- jam akad
- lokasi resepsi
- jam resepsi
- jumlah tamu
- request lagu
- request makanan
- susunan acara sementara
- catatan khusus

Budget & Payment:
- total paket
- total terbayar
- sisa tagihan
- history invoice
- status pembayaran

My Guests:
- input tamu manual
- status RSVP: hadir / tidak hadir / belum konfirmasi

3. Flow Bisnis
Alur utama sistem:
Client dibuat / daftar
→ pilih tanggal acara
→ pilih paket
→ pilih konsep/adat
→ isi preference
→ upload referensi
→ isi digital form
→ booking masuk ke admin review
→ admin review data client
→ admin pilih vendor final berdasarkan paket dan availability
→ admin assign crew
→ admin buat checklist barang/aset
→ admin approve project
→ sistem generate timeline WO dan timeline client
→ pembayaran berjalan
→ event dimonitor
→ event selesai
→ laporan dibuat.

4. Vendor & Resource Rules
Sistem boleh memiliki lebih dari 1 event pada tanggal yang sama.
Jangan blokir berdasarkan tanggal event.

Yang harus diblokir adalah resource conflict:
- vendor tidak boleh double booking di jam yang bentrok
- crew tidak boleh ditugaskan di jam yang bentrok
- aset/barang tidak boleh dipakai melebihi stok pada jam yang bentrok

Vendor yang dipilih client tidak perlu ada dulu.
Untuk saat ini, client hanya memilih preference.
Vendor final ditentukan oleh admin sesuai:
- paket
- kategori vendor
- tanggal acara
- jam acara
- availability vendor

5. Paket Rules
Saat tambah/edit paket:
- admin pilih kategori vendor dulu
- setelah kategori dipilih, tampilkan vendor sesuai kategori
- admin pilih vendor mana saja yang boleh masuk ke paket tersebut

Contoh:
Paket Gold:
- kategori Musik → pilih Band A, Band B
- kategori Dekorasi → pilih Dekor A, Dekor B
- kategori MUA → pilih MUA A, MUA B

6. Timeline Rules
Timeline client dan timeline WO harus berbeda.

Timeline Client:
- sederhana
- hanya progress besar
- mudah dipahami client

Timeline WO:
- detail internal
- berisi task operasional
- PIC
- deadline
- status
- catatan

7. Reporting
Tambahkan laporan:
- laporan event
- laporan pembayaran client
- laporan keuangan detail
- laporan keuangan rekap
- profit per event
- export Excel
- export PDF

8. Prinsip UI
- semua list utama gunakan table view
- form harus bisa scroll jika panjang
- harga harus format Rupiah
- gunakan custom confirmation dialog, bukan browser alert
- dropdown master data harus ascending
- semua form punya validasi
- jangan rewrite seluruh project
- perbaiki secara bertahap dan jangan rusak fitur yang sudah ada
- semua katalog di sisi client harus berupa gambar yg bisa dilihat langsung seperti lihat di ig

Tujuan akhir:
Aplikasi harus terasa seperti sistem kerja Wedding Organizer sungguhan:
client menyampaikan kebutuhan dan preferensi,
admin melakukan review dan finalisasi,
WO mengatur vendor, crew, aset, timeline, pembayaran,
lalu semua data masuk ke laporan.