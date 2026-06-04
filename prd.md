# PRD — Landing Page, Form Reservasi, dan Dashboard Rockshill Campground

## 1. Ringkasan Produk

Rockshill Campground (lokasi di : https://maps.app.goo.gl/DfcJr7Fbd4JmpxBq7) membutuhkan sistem website yang terdiri dari tiga bagian utama:

1. **Landing Page**

   * Menampilkan informasi utama Rockshill Campground.
   * Menjelaskan paket camping, fasilitas, galeri, lokasi, aturan, dan CTA reservasi.
   * Fokus pada konversi pengunjung menjadi calon customer/reservasi.

2. **Form Reservasi**

   * Memudahkan customer mengisi data reservasi secara mandiri.
   * Menghitung estimasi biaya berdasarkan tanggal, jumlah orang, paket, HTM, flysheet, dan sewa alat tambahan.
   * Menghasilkan data reservasi yang rapi untuk admin.

3. **Dashboard Admin**

   * Mengelola data reservasi, customer, pembayaran, ketersediaan tanggal, stok alat, dan laporan.
   * Membantu tim Rockshill memantau order harian, status pembayaran, kebutuhan alat, serta data operasional.

## 2. Tujuan Produk

### Tujuan Utama

Membuat sistem digital yang mampu mempercepat proses reservasi, mengurangi chat berulang dengan customer, dan membantu admin mengelola data camping secara lebih rapi.

### Tujuan Bisnis

* Meningkatkan jumlah reservasi dari website.
* Mengurangi kesalahan pencatatan manual.
* Mempermudah perhitungan total sewa dan HTM.
* Membantu admin mengetahui jadwal penuh/kosong.
* Menjadi pusat data customer dan transaksi Rockshill.

## 3. Target Pengguna

### Customer

Pengunjung yang ingin:

* Melihat informasi camping.
* Membandingkan paket.
* Mengecek harga.
* Mengisi reservasi.
* Menghubungi admin via WhatsApp.

### Admin

Tim internal Rockshill yang bertugas:

* Mengecek reservasi masuk.
* Mengonfirmasi pembayaran.
* Mengatur jadwal.
* Mengelola stok alat.
* Melihat laporan harian/bulanan.

### Onsite Staff

Tim lapangan yang membutuhkan:

* Daftar tamu hari ini.
* Detail paket dan alat yang harus disiapkan.
* Status check-in/check-out.
* Catatan khusus dari customer.

## 4. Brand & Visual Direction

### Base Color

* Broken White sebagai warna dasar/background utama.
* Brown utama: `#A7752A`.

### Nuansa Visual

* Natural
* Warm
* Earthy
* Premium outdoor
* Clean dan modern
* Tidak terlalu ramai
* Cocok untuk camping ground yang nyaman, family-friendly, dan aesthetic.

### Rekomendasi Warna Pendukung

* Broken White: `#F8F4EC`
* Primary Brown: `#A7752A`
* Dark Brown: `#4A2F18`
* Soft Beige: `#E8D8C3`
* Forest Green Accent: `#2F4A33`
* Warm Gray: `#77736B`

### Gaya UI

* Rounded corner sedang.
* Card layout bersih.
* Foto alam/camping besar.
* CTA jelas.
* Typography modern dan mudah dibaca.
* Mobile-first karena mayoritas customer kemungkinan datang dari Instagram, TikTok, WhatsApp, dan Google.

## 5. Struktur Landing Page

### 5.1 Hero Section

Isi:

* Headline utama.
* Subheadline.
* Foto/video area camping.
* CTA utama: “Reservasi Sekarang”.
* CTA sekunder: “Lihat Paket”.
* Badge singkat seperti:

  * Family Friendly
  * View Alam
  * Sewa Tenda Tersedia
  * Cocok untuk Grup

Contoh headline:
“Camping Nyaman dengan View Alam di Rockshill Campground”

### 5.2 Section Tentang Rockshill

Menjelaskan:

* Apa itu Rockshill.
* Suasana tempat.
* Cocok untuk siapa.
* Keunggulan utama.

### 5.3 Section Paket Camping

Menampilkan pilihan:

* Paket Lengkap
* Paket Tenda
* Bawa Tenda Sendiri
* Sewa Alat Tambahan

Catatan sistem:

* HTM adalah tiket masuk.
* Hanya paket lengkap yang sudah termasuk beberapa komponen tertentu sesuai aturan final.
* Paket selain paket lengkap perlu menghitung HTM secara terpisah.
* Flysheet disarankan untuk paket tenda kecuali paket yang sudah include.

### 5.4 Section Fasilitas

Contoh fasilitas:

* Area camp
* Toilet
* Mushola
* Parkir
* Colokan listrik
* Warung/kantin
* View alam
* Area api unggun
* Spot foto

### 5.5 Section Galeri

Menampilkan:

* Foto area camp.
* Foto tenda.
* Foto aktivitas.
* Foto malam hari.
* Foto fasilitas.

### 5.6 Section Cara Reservasi

Flow sederhana:

1. Pilih tanggal.
2. Pilih paket.
3. Isi data.
4. Konfirmasi via admin.
5. Lakukan pembayaran.
6. Datang sesuai jadwal.

### 5.7 Section FAQ

Contoh:

* Apakah bisa bawa tenda sendiri?
* Apakah harus pakai flysheet?
* Apakah HTM sudah termasuk paket?
* Apakah bisa refund/reschedule?
* Apakah aman untuk keluarga?
* Apakah ada listrik?
* Apakah bisa booking rombongan?

### 5.8 Section Lokasi

Isi:

* Alamat lengkap.
* Embed Google Maps.
* Patokan lokasi.
* Estimasi waktu dari titik populer.
* Tombol “Buka Google Maps”.

### 5.9 CTA Akhir

Isi:

* Ajakan reservasi.
* Tombol WhatsApp.
* Tombol Form Reservasi.

## 6. Form Reservasi

### 6.1 Tujuan Form

Form digunakan customer untuk mengirim data reservasi secara lengkap dan membantu admin mendapatkan data yang langsung terstruktur.

### 6.2 Field Customer

* Nama lengkap.
* Nomor WhatsApp.
* Email, opsional.
* Domisili, opsional.
* Jumlah peserta.
* Jumlah dewasa.
* Jumlah anak-anak.
* Catatan khusus.

### 6.3 Field Tanggal

* Tanggal check-in.
* Tanggal check-out.
* Jumlah malam otomatis.
* Estimasi jam kedatangan.
* Estimasi jam pulang, opsional.

### 6.4 Field Paket

* Pilihan tipe reservasi:

  * Paket Lengkap
  * Sewa Paket Tenda
  * Bawa Tenda Sendiri
  * Sewa Alat Saja
* Pilihan kapasitas paket.
* Jumlah tenda.
* Tambahan flysheet.
* Tambahan matras.
* Tambahan alat grill.
* Tambahan alat lain.

### 6.5 Perhitungan Harga

Sistem harus dapat menghitung:

* HTM.
* Harga paket.
* Flysheet.
* Sewa alat tambahan.
* Jumlah malam.
* Total estimasi.
* DP minimal, jika ada.
* Sisa pembayaran.

### 6.6 Validasi Form

* Nomor WhatsApp wajib.
* Tanggal wajib.
* Jumlah orang wajib.
* Paket wajib.
* Jika customer memilih paket tenda, sistem menampilkan rekomendasi flysheet.
* Jika customer menolak flysheet, sistem dapat menampilkan peringatan/manfaat flysheet.
* Jika tanggal penuh, customer tidak bisa submit atau diarahkan hubungi admin.

### 6.7 Setelah Submit

Customer melihat:

* Ringkasan reservasi.
* Total estimasi.
* Instruksi pembayaran.
* Tombol WhatsApp admin dengan format pesan otomatis.
* Status awal: Pending Confirmation.

Admin menerima:

* Data reservasi baru.
* Notifikasi.
* Detail kebutuhan alat.
* Status pembayaran.

## 7. Dashboard Admin

### 7.1 Login Admin

Fitur:

* Login email/password.
* Role akses:

  * Super Admin
  * Admin Reservasi
  * Staff Lapangan
  * Finance

### 7.2 Overview Dashboard

Menampilkan:

* Total reservasi hari ini.
* Total reservasi minggu ini.
* Total reservasi bulan ini.
* Total revenue.
* Reservasi pending.
* Reservasi confirmed.
* Tanggal penuh.
* Alat yang harus disiapkan hari ini.

### 7.3 Manajemen Reservasi

Fitur:

* List reservasi.
* Filter berdasarkan tanggal, status, nama, nomor WhatsApp.
* Detail reservasi.
* Edit reservasi.
* Ubah status:

  * Pending
  * Waiting Payment
  * DP Paid
  * Confirmed
  * Checked-in
  * Checked-out
  * Cancelled
  * Rescheduled
* Upload bukti pembayaran.
* Catatan admin.
* Cetak invoice/bill.

### 7.4 Kalender Reservasi

Fitur:

* Tampilan kalender bulanan.
* Indikator tanggal penuh.
* Total guest per tanggal.
* Total tenda per tanggal.
* Klik tanggal untuk melihat daftar reservasi.
* Blok tanggal tertentu jika tidak tersedia.

### 7.5 Manajemen Paket & Harga

Admin bisa mengatur:

* Nama paket.
* Harga paket.
* Kapasitas.
* Item include.
* Status aktif/nonaktif.
* Harga HTM.
* Harga flysheet.
* Harga alat tambahan.
* Aturan weekend/high season, jika ada.

### 7.6 Manajemen Stok Alat

Fitur:

* Data tenda.
* Data flysheet.
* Data matras.
* Data grill.
* Data alat lain.
* Jumlah stok.
* Stok tersedia.
* Stok terpakai berdasarkan tanggal.
* Peringatan jika stok kurang.

### 7.7 Manajemen Customer

Fitur:

* Database customer.
* Riwayat reservasi.
* Nomor WhatsApp.
* Catatan customer.
* Tag customer, misalnya: repeat customer, rombongan, family, corporate.

### 7.8 Pembayaran

Fitur:

* Status pembayaran.
* Nominal DP.
* Nominal pelunasan.
* Metode pembayaran.
* Upload bukti transfer.
* Riwayat pembayaran.
* Export laporan pembayaran.

### 7.9 Laporan

Laporan yang dibutuhkan:

* Laporan harian.
* Laporan mingguan.
* Laporan bulanan.
* Total reservasi.
* Total revenue.
* Paket paling laku.
* Tanggal paling ramai.
* Customer repeat.
* Sewa alat paling sering.
* Export Excel/PDF.

### 7.10 Pengaturan Website

Admin bisa mengubah:

* Konten landing page.
* Foto galeri.
* FAQ.
* Fasilitas.
* Nomor WhatsApp admin.
* Alamat.
* Link Google Maps.
* Jam operasional.
* Informasi rekening.

## 8. Integrasi

Potensi integrasi:

* WhatsApp click-to-chat.
* Google Sheets export/import.
* Payment gateway, misalnya Xendit.
* Email notification.
* Google Calendar.
* Meta Pixel.
* TikTok Pixel.
* Google Analytics.
* Supabase/PostgreSQL sebagai database.
* n8n untuk automation.

## 9. Non-Functional Requirements

### Performance

* Website cepat dibuka di mobile.
* Gambar harus terkompresi.
* Landing page ringan.

### Security

* Dashboard admin harus menggunakan login.
* Data customer tidak boleh terbuka publik.
* Role permission harus jelas.
* Upload bukti pembayaran harus aman.

### Responsiveness

* Mobile-first.
* Desktop tetap rapi.
* Form mudah digunakan di HP.

### Scalability

* Sistem harus bisa menampung data reservasi bertahun-tahun.
* Harga dan paket bisa diubah tanpa edit coding.

## 10. Success Metrics

Produk dianggap berhasil jika:

* Customer bisa reservasi tanpa harus tanya admin untuk hal basic.
* Admin bisa melihat semua reservasi dalam satu dashboard.
* Kesalahan hitung harga berkurang.
* Data reservasi lebih rapi.
* Proses follow-up WhatsApp lebih cepat.
* Laporan harian dan bulanan bisa dibuat otomatis.

## 11. MVP Scope

### Wajib Ada di Versi Pertama

* Landing page.
* Form reservasi.
* Perhitungan harga dasar.
* Dashboard list reservasi.
* Kalender reservasi.
* Status pembayaran.
* Export data.
* Manajemen paket dan harga.
* WhatsApp redirect setelah submit.

### Bisa Masuk Versi Berikutnya

* Payment gateway otomatis.
* Login customer.
* Loyalty/repeat customer.
* Promo/voucher.
* AI customer service.
* Integrasi stok otomatis penuh.
* Multi cabang.
* Dynamic pricing high season.

# Addendum PRD MVP v1.1 + v1.2 — Rockshill Campground

## Update Harga, Paket, Add-on, Package Include, Landing Page Content, Pricing Logic, dan Payment Preproduction

---

# 1. Overview Addendum

Dokumen ini merupakan pelengkap dari PRD MVP Rockshill Campground.

Addendum ini memperjelas:

1. Master harga Rockshill.
2. Paket utama dan harga.
3. Paket seasonal/hidden.
4. Sewa alat dan add-on.
5. Paket best seller dan recommended.
6. Isi detail setiap paket.
7. Perbedaan paket 2P dan 4P.
8. Perbedaan ukuran matras.
9. Pricing logic.
10. Multi-day calculation.
11. What to bring section.
12. Rules sebelum reservasi.
13. Dashboard price master.
14. Package management.
15. Invoice detail.
16. Database update.
17. Payment flow preproduction.
18. Acceptance criteria terbaru.

---

# 2. Price Master Requirement

Sistem harus memiliki halaman **Price Master** di dashboard admin untuk mengatur seluruh harga paket, HTM, sewa alat, add-on, seasonal package, dan item internal.

Admin harus bisa:

* Menambah item harga baru.
* Mengubah harga.
* Mengaktifkan/nonaktifkan item.
* Menentukan item tampil di landing page atau tidak.
* Menentukan item tampil di form customer atau tidak.
* Memberi label seperti Best Seller, Recommended, Seasonal, atau Hidden.
* Menentukan kategori item.
* Menentukan satuan harga.
* Menyimpan harga historis agar invoice lama tidak berubah ketika harga master diubah.

---

# 3. Master Harga Rockshill

## 3.1 HTM

| Item              |    Harga | Satuan    | Status            |
| ----------------- | -------: | --------- | ----------------- |
| HTM               | Rp35.000 | Per orang | Aktif             |
| HTM Tenda Sendiri | Rp45.000 | Per orang | Aktif             |
| HTM New Years     | Rp50.000 | Per orang | Hidden / Seasonal |

Aturan:

* HTM reguler untuk customer yang sewa paket/tenda: **Rp35.000/orang**.
* HTM bawa tenda sendiri: **Rp45.000/orang**.
* HTM New Years tidak tampil di landing page reguler.
* Anak di bawah 5 tahun free HTM.
* HTM dihitung per orang.
* Paket Lengkap sudah termasuk HTM sesuai kapasitas paket.
* Paket selain Paket Lengkap belum termasuk HTM.

---

## 3.2 Paket Utama

| Paket            |     Harga | Kapasitas | Status Landing Page | Label       |
| ---------------- | --------: | --------: | ------------------- | ----------- |
| Paket Konten     | Rp340.000 |   4 orang | Tampil              | Best Seller |
| Paket Fullset    | Rp240.000 |   4 orang | Tampil              | Reguler     |
| Paket Konten 2P  | Rp290.000 |   2 orang | Tampil              | Reguler     |
| Paket Fullset 2P | Rp190.000 |   2 orang | Tampil              | Reguler     |
| Paket Lengkap 2P | Rp490.000 |   2 orang | Tampil              | Reguler     |
| Paket Lengkap    | Rp540.000 |   4 orang | Tampil              | Recommended |

Highlight landing page:

* **Paket Best Seller:** Paket Konten
* **Paket Rekomendasi:** Paket Lengkap

---

## 3.3 Paket Seasonal / Hidden

| Paket                  |     Harga | Status            |
| ---------------------- | --------: | ----------------- |
| Paket New Year 4 Orang | Rp590.000 | Hidden / Seasonal |
| Paket New Year 2 Orang | Rp540.000 | Hidden / Seasonal |

Aturan:

* Paket New Year tidak tampil di landing page reguler.
* Paket New Year tetap disimpan di dashboard admin.
* Admin bisa mengaktifkan paket ini saat periode New Year/high season.
* HTM New Years juga hanya digunakan untuk event seasonal.

---

## 3.4 Sewa Alat

| Item            |     Harga | Satuan        | Status |
| --------------- | --------: | ------------- | ------ |
| Tenda           | Rp100.000 | Per item sewa | Aktif  |
| Sleeping Bag    |  Rp15.000 | Per item sewa | Aktif  |
| Matras 90x180   |  Rp10.000 | Per item sewa | Aktif  |
| Matras 180x180  |  Rp20.000 | Per item sewa | Aktif  |
| Flysheet        |  Rp35.000 | Per item sewa | Aktif  |
| Lampu Tenda     |  Rp15.000 | Per item sewa | Aktif  |
| Lampu Tumblr    |  Rp25.000 | Per item sewa | Aktif  |
| Kompor Portable |  Rp30.000 | Per item sewa | Aktif  |
| Gas             |  Rp20.000 | Per item      | Aktif  |
| Kursi Lipat     |  Rp20.000 | Per item sewa | Aktif  |
| Meja Lipat      |  Rp35.000 | Per item sewa | Aktif  |
| Meja Lipat Besi |  Rp35.000 | Per item sewa | Aktif  |
| Kabel Roll      |  Rp30.000 | Per item sewa | Aktif  |
| Nesting         |  Rp30.000 | Per item sewa | Aktif  |
| Kasur           |  Rp35.000 | Per item sewa | Aktif  |
| Tiang Besi      |   Rp5.000 | Per item sewa | Aktif  |
| Tripod          |  Rp30.000 | Per item sewa | Aktif  |

Catatan:

* `Matras` Rp10.000 adalah matras ukuran **90x180**.
* `Matras 1 Tenda` Rp20.000 diganti label sistem menjadi **Matras 180x180** agar lebih jelas.
* Semua item sewa alat dihitung berdasarkan jumlah hari penggunaan.
* Jika customer booking 2 hari, item sewa dihitung **jumlah hari x 2**.
* Item yang sudah termasuk dalam paket tidak dihitung lagi sebagai add-on, kecuali customer menambah quantity tambahan.

---

## 3.5 Grill, Api Unggun, dan Add-on Makanan

| Item               |     Harga | Satuan     | Status |
| ------------------ | --------: | ---------- | ------ |
| Paket Grill        | Rp130.000 | Per set    | Aktif  |
| Kayu Bakar         |  Rp35.000 | Per bundle | Aktif  |
| Extra Sosis        |  Rp15.000 | Per pack   | Aktif  |
| Extra Daging Slice |  Rp80.000 | Per 500gr  | Aktif  |
| Extra Ayam Fillet  |  Rp38.000 | Per 250gr  | Aktif  |

Catatan:

* Paket Grill dihitung per set.
* Kayu Bakar dihitung per bundle.
* Extra Sosis dihitung per pack.
* Extra Daging Slice dihitung per 500gr.
* Extra Ayam Fillet dihitung per 250gr.
* Item **Extend Alat Grill** dihilangkan dari sistem MVP.
* Jika item Extend Alat Grill masih ada di data lama, statusnya dibuat inactive/hidden, bukan dihapus permanen.

---

## 3.6 Kendaraan

| Item  | Harga | Satuan        | Status |
| ----- | ----: | ------------- | ------ |
| Mobil |   Rp0 | Per kendaraan | Aktif  |
| Motor |   Rp0 | Per kendaraan | Aktif  |

Catatan:

* Mobil dan motor tetap dicatat di reservasi walaupun harga Rp0.
* Data kendaraan penting untuk operasional parkir dan kapasitas lokasi.
* Form customer wajib menanyakan jumlah mobil dan motor.

---

# 4. Kategori Item di Dashboard

Setiap item di Price Master harus memiliki kategori:

1. HTM
2. Paket
3. Paket Seasonal
4. Sewa Alat
5. Add-on
6. Grill/Food
7. Kendaraan
8. Internal Only

Setiap item memiliki field:

* Nama item
* Harga
* Satuan
* Kategori
* Aktif/nonaktif
* Tampil di landing page: yes/no
* Tampil di form customer: yes/no
* Bisa dipilih customer: yes/no
* Keterangan
* Label
* Urutan tampil

---

# 5. Package Include Final

Sistem harus memiliki module **Package Management** yang memungkinkan admin mengatur isi setiap paket berdasarkan item dari inventory/price master.

Paket utama Rockshill terdiri dari:

1. Paket Konten
2. Paket Konten 2P
3. Paket Fullset
4. Paket Fullset 2P
5. Paket Lengkap
6. Paket Lengkap 2P

Paket New Year tetap disimpan sebagai hidden/seasonal.

---

# 6. Paket Konten

## 6.1 Paket Konten 4P

Harga:

**Rp340.000**

Include:

| Item          | Qty |
| ------------- | --: |
| Tenda 4P      |   1 |
| Sleeping Bag  |   4 |
| Matras 90x180 |   4 |
| Lampu Tenda   |   1 |
| Lampu Tumblr  |   1 |
| Kursi Lipat   |   2 |
| Meja          |   1 |
| Kabel Roll    |   1 |
| Tripod        |   1 |

Status:

* Tampil di landing page.
* Badge: **Best Seller**
* Cocok untuk customer yang ingin camping lebih aesthetic/konten-ready.
* Belum termasuk HTM.
* Belum termasuk flysheet.
* Flysheet sangat direkomendasikan.

---

## 6.2 Paket Konten 2P

Harga:

**Rp290.000**

Include:

| Item          | Qty |
| ------------- | --: |
| Tenda 2P      |   1 |
| Sleeping Bag  |   2 |
| Matras 90x180 |   2 |
| Lampu Tenda   |   1 |
| Lampu Tumblr  |   1 |
| Kursi Lipat   |   2 |
| Meja          |   1 |
| Kabel Roll    |   1 |
| Tripod        |   1 |

Status:

* Tampil di landing page.
* Belum termasuk HTM.
* Belum termasuk flysheet.
* Flysheet sangat direkomendasikan.

---

# 7. Paket Fullset

## 7.1 Paket Fullset 4P

Harga:

**Rp240.000**

Include:

| Item          | Qty |
| ------------- | --: |
| Tenda 4P      |   1 |
| Sleeping Bag  |   4 |
| Matras 90x180 |   4 |
| Lampu Tenda   |   1 |
| Kabel Roll    |   1 |

Status:

* Tampil di landing page.
* Belum termasuk HTM.
* Belum termasuk flysheet.
* Flysheet sangat direkomendasikan.
* Cocok untuk customer yang butuh paket basic tapi tetap praktis.

---

## 7.2 Paket Fullset 2P

Harga:

**Rp190.000**

Include:

| Item          | Qty |
| ------------- | --: |
| Tenda 2P      |   1 |
| Sleeping Bag  |   2 |
| Matras 90x180 |   2 |
| Lampu Tenda   |   1 |
| Kabel Roll    |   1 |

Status:

* Tampil di landing page.
* Belum termasuk HTM.
* Belum termasuk flysheet.
* Flysheet sangat direkomendasikan.

---

# 8. Paket Lengkap

## 8.1 Paket Lengkap 4P

Harga:

**Rp540.000**

Include:

| Item          |     Qty |
| ------------- | ------: |
| Tenda 4P      |       1 |
| Sleeping Bag  |       4 |
| Matras 90x180 |       4 |
| Lampu Tenda   |       1 |
| Lampu Tumblr  |       1 |
| Kursi Lipat   |       2 |
| Meja          |       1 |
| Paket Grill   |       1 |
| Alat Masak    |   1 set |
| Flysheet      |       1 |
| Kabel Roll    |       1 |
| HTM           | 4 orang |

Status:

* Tampil di landing page.
* Badge: **Recommended**
* Sudah termasuk HTM.
* Sudah termasuk flysheet.
* Sudah termasuk kabel roll.
* Cocok untuk customer yang ingin paket paling praktis.

---

## 8.2 Paket Lengkap 2P

Harga:

**Rp490.000**

Include:

| Item          |     Qty |
| ------------- | ------: |
| Tenda 2P      |       1 |
| Sleeping Bag  |       2 |
| Matras 90x180 |       2 |
| Lampu Tenda   |       1 |
| Lampu Tumblr  |       1 |
| Kursi Lipat   |       2 |
| Meja          |       1 |
| Paket Grill   |       1 |
| Alat Masak    |   1 set |
| Flysheet      |       1 |
| Kabel Roll    |       1 |
| HTM           | 2 orang |

Status:

* Tampil di landing page.
* Sudah termasuk HTM.
* Sudah termasuk flysheet.
* Sudah termasuk kabel roll.
* Cocok untuk pasangan atau 2 orang yang ingin paket lengkap tanpa ribet.

---

# 9. Perbedaan Paket 2P dan 4P

Perbedaan utama antara paket 2P dan 4P adalah:

1. Jenis/ukuran tenda.
2. Jumlah sleeping bag.
3. Jumlah matras.
4. Kapasitas orang.

## 9.1 Tenda 2P

Digunakan untuk:

* Paket Konten 2P
* Paket Fullset 2P
* Paket Lengkap 2P

Karakter:

* Kapasitas 2 orang.
* Ukuran lebih compact.
* Cocok untuk couple atau 2 orang.

## 9.2 Tenda 4P

Digunakan untuk:

* Paket Konten
* Paket Fullset
* Paket Lengkap

Karakter:

* Kapasitas 4 orang.
* Headroom lebih luas.
* Lebih nyaman untuk 3–4 orang.
* Cocok untuk family/group kecil.

## 9.3 Sleeping Bag dan Matras Quantity

Jumlah sleeping bag dan matras mengikuti kapasitas paket:

| Paket    | Jumlah SB | Jumlah Matras 90x180 |
| -------- | --------: | -------------------: |
| Paket 2P |         2 |                    2 |
| Paket 4P |         4 |                    4 |

---

# 10. Updated Package Table

| Paket            |     Harga | Kapasitas | Tenda    | Include HTM | Include Flysheet | Label       |
| ---------------- | --------: | --------: | -------- | ----------- | ---------------- | ----------- |
| Paket Konten     | Rp340.000 |   4 orang | Tenda 4P | Tidak       | Tidak            | Best Seller |
| Paket Konten 2P  | Rp290.000 |   2 orang | Tenda 2P | Tidak       | Tidak            | -           |
| Paket Fullset    | Rp240.000 |   4 orang | Tenda 4P | Tidak       | Tidak            | -           |
| Paket Fullset 2P | Rp190.000 |   2 orang | Tenda 2P | Tidak       | Tidak            | -           |
| Paket Lengkap    | Rp540.000 |   4 orang | Tenda 4P | Ya, 4 orang | Ya               | Recommended |
| Paket Lengkap 2P | Rp490.000 |   2 orang | Tenda 2P | Ya, 2 orang | Ya               | -           |

---

# 11. Landing Page Package Display

## 11.1 Paket yang Ditampilkan

Landing page menampilkan paket utama berikut:

1. Paket Konten
2. Paket Lengkap
3. Paket Konten 2P
4. Paket Lengkap 2P
5. Paket Fullset
6. Paket Fullset 2P

Paket yang tidak tampil:

* Paket New Year 4 Orang
* Paket New Year 2 Orang
* HTM New Years

---

## 11.2 Tampilan Card Paket

Setiap card paket harus menampilkan:

* Nama paket.
* Harga.
* Kapasitas.
* Label/badge jika ada.
* List include item.
* Info apakah sudah termasuk HTM atau belum.
* Info apakah sudah termasuk flysheet atau belum.
* CTA “Pilih Paket”.
* CTA “Tanya Admin” opsional.

---

## 11.3 Paket Konten Copy

Badge:

**Best Seller**

Short copy:

Paket favorit untuk camping yang lebih nyaman dan konten-ready. Sudah termasuk tenda, sleeping bag, matras, lampu, kursi, meja, kabel roll, dan tripod.

Catatan kecil:

Belum termasuk HTM dan flysheet.

---

## 11.4 Paket Fullset Copy

Short copy:

Paket basic yang tetap praktis untuk camping. Sudah termasuk tenda, sleeping bag, matras, lampu tenda, dan kabel roll.

Catatan kecil:

Belum termasuk HTM dan flysheet.

---

## 11.5 Paket Lengkap Copy

Badge:

**Recommended**

Short copy:

Paket paling praktis untuk customer yang ingin tinggal datang dan camping tanpa ribet. Sudah termasuk perlengkapan utama, flysheet, paket grill, alat masak, kabel roll, dan HTM.

Catatan kecil:

Sudah termasuk HTM sesuai kapasitas paket.

---

# 12. Pricing Logic

## 12.1 General Formula

Total reservasi dihitung dari:

**Total = Paket + HTM + Sewa Alat Tambahan + Add-on + Kendaraan + Biaya Lain**

Keterangan:

* Kendaraan saat ini Rp0, tetapi tetap dicatat.
* Anak di bawah 5 tahun tidak kena HTM.
* Harga paket/alat/add-on dikali jumlah hari penggunaan jika item bersifat sewa.
* Paket grill dan makanan dihitung sesuai quantity.

---

## 12.2 Formula Paket Konten dan Fullset

Untuk Paket Konten, Paket Konten 2P, Paket Fullset, dan Paket Fullset 2P:

**Total = Harga Paket + HTM Reguler + Flysheet jika dipilih + Add-on tambahan**

Dengan:

* HTM Reguler = Rp35.000/orang.
* Flysheet sangat direkomendasikan.
* Jika customer menolak flysheet, sistem menampilkan manfaat flysheet.
* Jika customer tetap menolak, customer boleh lanjut tanpa flysheet.

---

## 12.3 Formula Paket Lengkap

Untuk Paket Lengkap dan Paket Lengkap 2P:

**Total = Harga Paket Lengkap + Add-on tambahan**

Dengan:

* HTM sudah termasuk sesuai kapasitas paket.
* Flysheet sudah termasuk.
* Kabel roll sudah termasuk.
* Paket grill dan alat masak sudah termasuk.
* Jika jumlah orang melebihi kapasitas paket, sistem harus menambahkan HTM tambahan atau merekomendasikan paket tambahan sesuai aturan final.

---

## 12.4 Formula Bawa Tenda Sendiri

Untuk customer yang bawa tenda sendiri:

**Total = HTM Tenda Sendiri per orang + Add-on/Sewa Alat Tambahan**

Dengan:

* HTM Tenda Sendiri: Rp45.000/orang.
* Anak di bawah 5 tahun free.
* Customer wajib mengisi jumlah tenda sendiri.
* Customer wajib memilih preferensi area.
* Area Campervan dan Area 8 diprioritaskan untuk bawa tenda sendiri saat weekend/hari libur.

---

## 12.5 Formula Day Visit / Tidak Menginap

Jika customer datang pagi sampai sore dan tidak menginap:

**Total = Rp15.000/orang + Add-on jika ada**

Syarat:

* Hanya bisa jika area tidak full.
* Harga sewa paket dan alat tetap mengikuti harga normal jika customer menggunakan alat/paket.
* HTM day visit hanya berlaku untuk kunjungan non-menginap.

---

## 12.6 Formula Multi-day / 2 Hari atau Lebih

Jika customer booking lebih dari 1 hari:

* Harga paket dikali jumlah hari.
* Harga alat dikali jumlah hari.
* Flysheet dikali jumlah hari.
* Stok alat dikunci selama tanggal booking.
* Area dikunci selama tanggal booking.

Aturan final:

**Booking 2 hari dihitung jumlah hari x 2.**

Contoh:

Jika customer memilih Paket Fullset Rp240.000 untuk 2 hari:

**Rp240.000 x 2 = Rp480.000**

Jika customer menambah Flysheet Rp35.000 untuk 2 hari:

**Rp35.000 x 2 = Rp70.000**

---

## 12.7 DP Logic

Minimal DP:

**50% dari grand total**

Aturan:

* DP dihitung persentase.
* Pembulatan DP menggunakan pembulatan ke atas.
* Customer bisa memilih DP atau lunas.
* Jika DP, invoice harus menampilkan:

  * Grand total
  * DP dibayar
  * Sisa pembayaran
* Sisa pembayaran dilakukan pada Hari H di camp melalui cash atau QRIS.

---

# 13. Flysheet Logic

Aturan:

* Paket Lengkap dan Paket Lengkap 2P sudah termasuk flysheet.
* Paket Konten, Paket Konten 2P, Paket Fullset, dan Paket Fullset 2P belum termasuk flysheet.
* Semua paket selain Paket Lengkap sangat direkomendasikan menggunakan flysheet.
* Sistem otomatis menawarkan flysheet.
* Jika customer menolak, sistem menampilkan manfaat flysheet.
* Jika customer tetap menolak, customer boleh lanjut tanpa flysheet.
* Harga flysheet dihitung berdasarkan jumlah hari penggunaan.

Manfaat flysheet yang ditampilkan:

* Membantu melindungi area tenda dari panas dan hujan.
* Membuat area depan tenda lebih nyaman.
* Bisa dipakai untuk area duduk/santai.
* Lebih aman untuk cuaca yang berubah-ubah.

---

# 14. Inventory Booking Logic

Ketika reservasi menggunakan paket, sistem harus otomatis mengunci stok item include.

Contoh Paket Konten 4P mengunci:

* 1 tenda 4P
* 4 sleeping bag
* 4 matras 90x180
* 1 lampu tenda
* 1 lampu tumblr
* 2 kursi lipat
* 1 meja
* 1 kabel roll
* 1 tripod

Contoh Paket Fullset 4P mengunci:

* 1 tenda 4P
* 4 sleeping bag
* 4 matras 90x180
* 1 lampu tenda
* 1 kabel roll

Contoh Paket Lengkap 2P mengunci:

* 1 tenda 2P
* 2 sleeping bag
* 2 matras 90x180
* 1 lampu tenda
* 1 lampu tumblr
* 2 kursi lipat
* 1 meja
* 1 paket grill
* 1 alat masak
* 1 flysheet
* 1 kabel roll

---

# 15. Form Reservasi Update

## 15.1 Field Paket dan Harga

Form customer harus membaca data dari Price Master, bukan hardcode.

Customer bisa memilih:

1. Paket utama.
2. Bawa tenda sendiri.
3. Sewa alat tambahan.
4. Add-on grill/food/kayu bakar.
5. Jumlah kendaraan.
6. DP atau lunas.

## 15.2 Field Jumlah Kendaraan

Form wajib memiliki field:

* Jumlah mobil
* Jumlah motor

Walaupun harga Rp0, data tetap masuk ke dashboard dan invoice.

## 15.3 Field What to Bring

Sebelum customer submit reservasi, sistem menampilkan checklist “Yang Harus Dibawa”.

Customer tidak perlu mencentang satu per satu, tetapi wajib melihat informasi ini sebelum menyetujui rules reservasi.

---

# 16. What to Bring Section

Section ini tampil di landing page dan juga sebelum customer submit reservasi.

## 16.1 List yang Harus Dibawa

Customer disarankan membawa:

1. Pakaian ganti dan pakaian hangat.
2. Perlengkapan smartphone seperti powerbank, charger, dan kabel.
3. Obat-obatan pribadi.
4. Makanan pribadi.
5. Snack pribadi.
6. Peralatan mandi.
7. Jas hujan.
8. Good mood.

## 16.2 Copywriting Landing Page

Judul section:

**Yang Perlu Dibawa**

Deskripsi:

Biar camping makin nyaman, jangan lupa siapin beberapa barang pribadi sebelum datang ke Rockshill.

List:

* Pakaian ganti & pakaian hangat
* Powerbank, charger, dan perlengkapan smartphone
* Obat-obatan pribadi
* Makanan pribadi
* Snack pribadi
* Peralatan mandi
* Jas hujan
* Good mood wajib dibawa

---

# 17. Rules Before Reservation

Sebelum customer masuk/submit form reservasi, sistem menampilkan ringkasan aturan:

1. Tidak bisa refund.
2. Reschedule hanya bisa maksimal H-3.
3. Anak di bawah 5 tahun free HTM.
4. Paket Lengkap sudah termasuk HTM.
5. Paket selain Paket Lengkap belum termasuk HTM.
6. Flysheet sangat direkomendasikan untuk paket selain Paket Lengkap.
7. Jika tidak menyelesaikan pembayaran dalam 1 jam, booking otomatis expired.
8. Pelunasan dilakukan di camp pada Hari H.
9. Customer wajib mengisi data dengan benar.
10. Area yang dipilih customer adalah preferensi, penentuan final tetap bisa disesuaikan oleh admin.

Customer wajib mencentang:

**“Saya sudah membaca dan menyetujui aturan reservasi Rockshill Campground.”**

---

# 18. Payment Flow Preproduction

Untuk tahap preproduction, sistem menggunakan:

**Manual Transfer BCA**

Payment gateway belum wajib di tahap preproduction.

## 18.1 Flow Manual Transfer BCA

1. Customer mengisi form reservasi.
2. Customer melihat summary booking.
3. Customer diarahkan ke halaman pembayaran BCA.
4. Sistem menampilkan:

   * Nomor rekening BCA.
   * Nama pemilik rekening.
   * Total pembayaran.
   * Minimal DP 50%.
   * Instruksi upload bukti transfer.
5. Customer upload bukti transfer.
6. Booking masuk ke dashboard admin dengan status menunggu verifikasi.
7. Admin melakukan verifikasi pembayaran manual.
8. Jika valid, admin mengubah status menjadi Confirmed.
9. Jika tidak valid, admin dapat menandai pembayaran sebagai rejected dan memberi catatan.

## 18.2 Status Payment Preproduction

Status pembayaran:

1. Waiting Payment
2. Waiting Verification
3. Payment Confirmed
4. Payment Rejected
5. Expired

## 18.3 Booking Hold

Aturan:

* Saat customer masuk ke payment page, slot/area/stok dapat di-hold sementara selama 1 jam.
* Jika customer tidak upload bukti transfer dalam 1 jam, booking menjadi Expired.
* Jika customer upload bukti transfer dalam 1 jam, booking masuk ke Waiting Verification.
* Setelah masuk Waiting Verification, slot tetap tertahan sampai admin melakukan validasi.
* Jika admin reject, slot dilepas.
* Jika admin confirm, booking menjadi Confirmed.

---

# 19. Dashboard Price Master Requirement

## 19.1 Price Master List View

Admin dapat melihat tabel item harga dengan kolom:

* Nama item
* Kategori
* Harga
* Satuan
* Status aktif
* Tampil di landing page
* Tampil di form customer
* Label
* Last updated

## 19.2 Create/Edit Price Item

Admin dapat mengatur:

* Nama item
* Harga
* Satuan:

  * per orang
  * per hari
  * per set
  * per bundle
  * per pack
  * per 500gr
  * per 250gr
  * per item sewa
  * per kendaraan
  * free
* Kategori
* Include HTM atau tidak
* Include flysheet atau tidak
* Bisa dipilih customer atau tidak
* Tampil di landing page atau tidak
* Tampil di dashboard saja atau tidak
* Label:

  * Best Seller
  * Recommended
  * Seasonal
  * Hidden
* Deskripsi item
* Urutan tampil

## 19.3 Safety Rule

Item yang pernah dipakai dalam reservasi lama tidak boleh dihapus permanen.

Solusi:

* Gunakan status inactive.
* Gunakan soft delete.
* Simpan harga historis di reservation_items agar invoice lama tidak berubah ketika harga master diubah.

---

# 20. Dashboard Package Management

## 20.1 Package Configuration Requirement

Sistem tidak boleh menganggap semua paket sama. Setiap paket harus punya konfigurasi:

* Package name
* Capacity
* Tent type
* Included items
* Included quantities
* Includes HTM: yes/no
* HTM included quantity
* Includes flysheet: yes/no
* Is best seller: yes/no
* Is recommended: yes/no
* Is public: yes/no
* Is seasonal: yes/no

## 20.2 Admin Package Management

Admin harus bisa:

1. Mengatur item include setiap paket.
2. Mengatur quantity item per paket.
3. Mengatur jenis tenda 2P atau 4P.
4. Mengatur kapasitas paket.
5. Mengatur apakah paket include HTM.
6. Mengatur jumlah HTM yang include.
7. Mengatur apakah paket include flysheet.
8. Mengatur label Best Seller/Recommended.
9. Mengatur status tampil di landing page.
10. Mengatur status hidden/seasonal.

---

# 21. Invoice Update

Invoice harus menampilkan item detail berdasarkan price master.

Invoice detail:

| Item | Qty | Harga | Jumlah Hari | Total |
| ---- | --: | ----: | ----------: | ----: |

Contoh item:

* Paket Konten
* HTM x jumlah orang
* Flysheet
* Kayu Bakar
* Mobil x 1 = Rp0
* Motor x 2 = Rp0

Invoice juga harus menampilkan:

* Total harga.
* DP minimal 50%.
* DP dibayar.
* Sisa pembayaran.
* Status pembayaran.
* Metode pembayaran.
* Kode booking.
* Rules singkat refund/reschedule.
* Status verifikasi admin jika manual transfer.

---

# 22. Database Update

## 22.1 price_items

Tabel untuk semua harga.

Field:

* id
* name
* category
* price
* unit_type
* is_active
* is_public
* is_customer_selectable
* is_landing_visible
* label
* description
* sort_order
* created_at
* updated_at
* deleted_at

## 22.2 packages

Field tambahan:

* label
* capacity
* tent_type
* is_best_seller
* is_recommended
* is_seasonal
* includes_htm
* htm_included_quantity
* includes_flysheet
* public_description

## 22.3 package_items

Tabel untuk isi paket.

Field:

* id
* package_id
* price_item_id
* item_name_snapshot
* quantity
* created_at
* updated_at

## 22.4 reservation_items

Field wajib menyimpan harga saat transaksi:

* id
* reservation_id
* price_item_id
* item_name_snapshot
* category_snapshot
* quantity
* unit_price_snapshot
* unit_type_snapshot
* usage_days
* total_price
* created_at
* updated_at

Tujuan:

Agar jika harga di Price Master berubah, invoice lama tetap aman dan tidak berubah.

## 22.5 payments

Field payment untuk manual BCA:

* id
* reservation_id
* payment_method
* bank_name
* account_number_snapshot
* account_name_snapshot
* amount
* payment_type
* proof_image
* status
* admin_verified_by
* admin_verified_at
* rejected_reason
* paid_at
* created_at
* updated_at

Status payment:

* waiting_payment
* waiting_verification
* payment_confirmed
* payment_rejected
* expired

---

# 23. Updated Landing Page Content Structure

Landing page final MVP:

1. Hero view alam.
2. Intro Rockshill.
3. Section view/foto besar.
4. Offering persuasive.
5. Paket utama:

   * Paket Konten sebagai Best Seller.
   * Paket Lengkap sebagai Recommended.
6. Fasilitas.
7. Cocok untuk:

   * Family
   * Couple
   * Group
   * Community
   * Bawa Tenda Sendiri
8. What to Bring.
9. Google Review screenshot.
10. FAQ singkat.
11. Lokasi.
12. CTA akhir.
13. Sticky WhatsApp.

---

# 24. MVP Implementation Notes

Untuk MVP tercepat, developer tidak boleh hardcode harga di logic form.

Semua harga wajib diambil dari database Price Master.

Namun sistem boleh menggunakan seed awal berikut:

## 24.1 Active Seed

| Item               |  Harga | Satuan        |
| ------------------ | -----: | ------------- |
| HTM                |  35000 | per orang     |
| HTM Tenda Sendiri  |  45000 | per orang     |
| Paket Konten       | 340000 | per hari      |
| Paket Fullset      | 240000 | per hari      |
| Paket Konten 2P    | 290000 | per hari      |
| Paket Fullset 2P   | 190000 | per hari      |
| Paket Lengkap 2P   | 490000 | per hari      |
| Paket Lengkap      | 540000 | per hari      |
| Tenda              | 100000 | per item sewa |
| Sleeping Bag       |  15000 | per item sewa |
| Matras 90x180      |  10000 | per item sewa |
| Matras 180x180     |  20000 | per item sewa |
| Flysheet           |  35000 | per item sewa |
| Lampu Tenda        |  15000 | per item sewa |
| Kompor Portable    |  30000 | per item sewa |
| Gas                |  20000 | per item      |
| Kursi Lipat        |  20000 | per item sewa |
| Meja Lipat         |  35000 | per item sewa |
| Lampu Tumblr       |  25000 | per item sewa |
| Kayu Bakar         |  35000 | per bundle    |
| Kabel Roll         |  30000 | per item sewa |
| Nesting            |  30000 | per item sewa |
| Kasur              |  35000 | per item sewa |
| Paket Grill        | 130000 | per set       |
| Extra Sosis        |  15000 | per pack      |
| Extra Daging Slice |  80000 | per 500gr     |
| Extra Ayam Fillet  |  38000 | per 250gr     |
| Meja Lipat Besi    |  35000 | per item sewa |
| Tiang Besi         |   5000 | per item sewa |
| Motor              |      0 | per kendaraan |
| Mobil              |      0 | per kendaraan |
| Tripod             |  30000 | per item sewa |

## 24.2 Hidden / Seasonal Seed

| Item                   |  Harga | Satuan    |
| ---------------------- | -----: | --------- |
| HTM New Years          |  50000 | per orang |
| Paket New Year 4 Orang | 590000 | per hari  |
| Paket New Year 2 Orang | 540000 | per hari  |

## 24.3 Inactive / Removed Seed

| Item              |    Harga | Status            |
| ----------------- | -------: | ----------------- |
| Extend Alat Grill | Rp20.000 | Inactive / Hidden |

Catatan:

* Extend Alat Grill tidak digunakan di MVP.
* Jika data sudah pernah ada, jangan dihapus permanen. Gunakan inactive/hidden.

---

# 25. Updated Acceptance Criteria

## 25.1 Price Master

Fitur dianggap selesai jika:

1. Semua harga bisa dimasukkan dari dashboard.
2. Admin bisa edit harga.
3. Admin bisa hide/show item.
4. Admin bisa kasih label Best Seller dan Recommended.
5. Harga lama di invoice tidak berubah saat master harga diedit.
6. Paket New Year bisa disimpan tapi hidden dari landing page.
7. Extend Alat Grill bisa disimpan sebagai inactive/hidden jika ada data lama.
8. Satuan harga tampil jelas di dashboard.

## 25.2 Landing Page Paket

Fitur dianggap selesai jika:

1. Paket Konten tampil sebagai Best Seller.
2. Paket Lengkap tampil sebagai Recommended.
3. Paket New Year tidak tampil.
4. What to Bring tampil dengan list final.
5. CTA reservasi dan WhatsApp tampil jelas.
6. Paket menampilkan info include HTM/flysheet secara jelas.
7. Paket menampilkan kapasitas 2P atau 4P secara jelas.

## 25.3 Form Pricing

Fitur dianggap selesai jika:

1. Total harga otomatis membaca dari Price Master.
2. HTM dihitung otomatis.
3. Anak di bawah 5 tahun tidak kena HTM.
4. Kendaraan tercatat walaupun harga Rp0.
5. DP 50% dihitung otomatis dengan pembulatan ke atas.
6. Invoice menampilkan breakdown item.
7. Paket Lengkap tidak menambahkan HTM lagi sesuai kapasitasnya.
8. Paket Konten dan Fullset otomatis menambahkan HTM.
9. Paket Konten dan Fullset menawarkan flysheet sebagai rekomendasi.
10. Booking 2 hari menghitung harga paket dan alat x2.
11. Paket dan alat menggunakan jumlah hari penggunaan sebagai multiplier.

## 25.4 Package Management

Package management dianggap selesai jika:

1. Paket Konten 4P memiliki include sesuai daftar final.
2. Paket Konten 2P memiliki include sama seperti Paket Konten, tetapi tenda 2P, SB 2, dan matras 2.
3. Paket Fullset 4P memiliki include sesuai daftar final.
4. Paket Fullset 2P memiliki include sama seperti Paket Fullset, tetapi tenda 2P, SB 2, dan matras 2.
5. Paket Lengkap 4P memiliki include lengkap termasuk HTM, flysheet, paket grill, alat masak, dan kabel roll.
6. Paket Lengkap 2P memiliki include sama seperti Paket Lengkap, tetapi tenda 2P, SB 2, dan matras 2.
7. Sistem otomatis mengunci inventory berdasarkan paket yang dipilih.
8. Sistem otomatis menghitung HTM tambahan hanya untuk paket yang belum include HTM.
9. Sistem tidak menambahkan flysheet ke Paket Lengkap karena sudah include.
10. Sistem tetap merekomendasikan flysheet untuk Paket Konten dan Paket Fullset.

## 25.5 Payment Preproduction

Payment preproduction dianggap selesai jika:

1. Customer bisa melihat instruksi transfer BCA.
2. Customer bisa upload bukti transfer.
3. Booking masuk sebagai Waiting Verification setelah bukti transfer diupload.
4. Admin bisa verifikasi pembayaran.
5. Admin bisa reject pembayaran dengan alasan.
6. Booking menjadi Confirmed setelah admin verify.
7. Booking menjadi Expired jika customer tidak upload bukti dalam 1 jam.
8. Slot/area/stok dilepas jika booking expired atau payment rejected.

---

# 26. Remaining Open Questions

Bagian yang masih perlu dikunci berikutnya:

## 26.1 Inventory Final

Perlu data final:

* Jumlah tenda 2P.
* Jumlah tenda 4P.
* Jumlah sleeping bag.
* Jumlah matras 90x180.
* Jumlah matras 180x180.
* Jumlah flysheet.
* Jumlah kursi.
* Jumlah meja.
* Jumlah lampu tenda.
* Jumlah lampu tumblr.
* Jumlah kabel roll.
* Jumlah tripod.
* Jumlah paket grill.
* Jumlah alat masak.
* Jumlah kompor portable.
* Jumlah nesting.
* Jumlah kasur.
* Jumlah gas.
* Jumlah item lain.

## 26.2 Detail Payment BCA

Perlu data final:

* Nomor rekening BCA.
* Nama pemilik rekening.
* Apakah transfer harus sesuai nominal unik atau tidak.
* Format instruksi pembayaran.
* Format pesan jika bukti transfer ditolak.

## 26.3 Landing Page Content Final

Perlu data final:

* Logo.
* Foto/video.
* Alamat lengkap.
* Google Maps link.
* Nomor WhatsApp admin.
* Jam operasional.
* Rules final campground.
* Screenshot review Google.

## 26.4 Area dan Capacity Final

Aturan terkait Area dan Paket telah ditetapkan sebagai berikut:

* **Kapasitas Tenda per Area**: Area 0 (1), Area 1 (3), Area 2 (5), Campervan (3), Area 3 (5), Area 4 (3), Area 4 Samping (1), Area 5 (2), Area 6 (2), Area 7 (2), Area 8 (3).
* **Rekomendasi Area & Paket**: 
  * Area 2, 3, 4, 6 mengutamakan (rekomendasi) Paket Konten dan Paket Lengkap. Paket Fullset dan Bawa Tenda Sendiri dibuat kurang menonjol (less visible).
  * Paket kapasitas 2 orang direkomendasikan di Area 2, 5, 6, 7 (walau boleh di semua area).
  * Area 1 sangat disarankan untuk kelompok dengan 2-3 tenda atau rombongan 6-12 orang.
* **Pembatasan Paket 4 Orang**: Paket berkapasitas 4 orang HANYA diizinkan di Area 1, 3, 4, 5, 8, dan Campervan.
* **Pembatasan Area Khusus**: Area Campervan dan Area 8 diprioritaskan KHUSUS untuk "Bawa Tenda Sendiri" pada saat weekend/hari libur. Pada saat weekday, bawa tenda sendiri bebas di semua area.
