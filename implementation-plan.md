# Implementation Plan — Rockshill Campground

## 1. Current Project Baseline

Project saat ini sudah memiliki fondasi frontend MVP untuk Rockshill Campground yang **telah dimigrasikan sepenuhnya ke ekosistem React**.

Stack yang digunakan:

- **Frontend:** Vite, React, React Router, Plain CSS global
- **Backend:** Node.js, Express.js, Prisma ORM, SQLite (Diputuskan untuk implementasi MVP)
- **Admin Dashboard:** Vanilla JavaScript & HTML (Akan dipertahankan sebagai MVP awal sebelum direfactor)

Struktur utama saat ini:

- Public customer website:
  - `/`
  - `/gallery`
  - `/area`
  - `/packages`
  - `/reservation`
  - `/check-reservation`
- Dashboard admin statis:
  - `pages/dashboard/login.html`
  - `pages/dashboard/index.html`
  - `pages/dashboard/reservations.html`
- API yang diasumsikan:
  - `http://localhost:8000/api/reservations`
  - `http://localhost:8000/api/admin/overview`
  - `http://localhost:8000/api/admin/reservations`

Catatan penting:

- **Migrasi UI Frontend sudah selesai (✅ Done)**. Seluruh halaman customer sudah berbentuk Single Page Application (SPA).
- Struktur folder backend (`/backend`) akan segera diinisiasi menggunakan stack Express + Prisma.
- Login admin masih mock menggunakan `localStorage`.
- Data harga, paket, add-on, dan rules masih hardcoded di frontend (perlu dipindah ke module terpisah).
- PRD sudah mengarah ke sistem yang lebih dinamis: price master, package management, payment, inventory, calendar, dan report.

## 2. Product Target

Target implementasi adalah mengubah frontend prototype menjadi MVP operasional yang bisa digunakan customer dan admin.

MVP operasional minimal harus bisa:

- Customer melihat landing page, paket, galeri, dan area camp.
- Customer mengisi reservasi.
- Customer mendapat nomor invoice.
- Customer diarahkan ke WhatsApp admin.
- Customer bisa cek status reservasi.
- Admin bisa login.
- Admin bisa melihat daftar reservasi.
- Admin bisa melihat detail reservasi.
- Admin bisa mengubah status reservasi.

Target lanjutan:

- Harga tidak lagi hardcoded.
- Admin bisa mengatur harga dan paket.
- Customer bisa upload bukti transfer.
- Admin bisa verifikasi pembayaran.
- Admin bisa melihat kalender reservasi.
- Sistem bisa menghitung stok alat berdasarkan tanggal booking.
- Admin bisa melihat laporan operasional.

## 3. Implementation Principles

Prinsip teknis yang sebaiknya diikuti:

- Jangan tambah kompleksitas sebelum dibutuhkan.
- Gunakan struktur data yang rapi sejak awal untuk reservasi dan pricing.
- Jangan simpan harga hanya sebagai teks.
- WhatsApp message boleh berupa hasil render, bukan sumber data utama.
- Semua hardcoded endpoint pindah ke environment variable.
- Data paket, add-on, area, dan pricing rules dipisahkan dari JSX.
- Dashboard admin boleh tetap vanilla JS untuk MVP cepat, tapi idealnya dimigrasikan ke React setelah core flow stabil.

## 4. Phase 1 — Frontend Stabilization & Data Extraction

Tujuan:

Merapikan *data structure* dan memisahkan *logic* dari UI komponen React yang sudah distabilkan.

Tasks:

- **✅ DONE:** Migrasi semua rute publik (`/`, `/gallery`, `/area`, `/packages`, `/reservation`, `/check-reservation`) ke React Router.
- Pindahkan data hardcoded ke module khusus:
  - `src/data/packages.js`
  - `src/data/addons.js`
  - `src/data/areas.js`
  - `src/data/pricingRules.js`
- Buat API helper:
  - `src/lib/api.js`
- Tambahkan environment variable:
  - `.env.example`
  - `VITE_API_BASE_URL=http://localhost:8000`
- Ganti seluruh hardcoded `http://localhost:8000` dengan helper API.
- Rapikan loading dan error state untuk:
  - submit reservasi
  - cek reservasi
  - dashboard overview
  - dashboard list reservasi

Output:

- Kode frontend lebih rapi.
- Endpoint API mudah diganti.
- Data pricing tidak bercampur langsung di JSX.

## 5. Phase 2 — Reservation Data Contract

Tujuan:

Membuat payload reservasi yang structured dan siap dipakai dashboard, payment, inventory, dan report.

Masalah saat ini:

- `paketText` dan `addonsText` dikirim sebagai string.
- String bagus untuk WhatsApp, tapi tidak ideal untuk database dan dashboard.

Payload schema yang direkomendasikan:

```js
{
  customer: {
    name: string,
    whatsapp: string,
    email: string | null
  },
  guests: {
    adults: number,
    children: number
  },
  vehicles: {
    motorbikes: number,
    cars: number
  },
  schedule: {
    checkin: string,
    checkout: string,
    nights: number,
    arrivalTime: string
  },
  area: {
    name: string
  },
  items: [
    {
      itemId: string,
      type: "package" | "equipment_rental" | "htm" | "flysheet" | "vehicle" | "discount",
      category: string | null,
      name: string,
      quantity: number,
      unitPrice: number,
      pricingType: "flat" | "per_night" | "per_person" | "per_booking",
      nights: number | null,
      subtotal: number
    }
  ],
  pricing: {
    packageTotal: number,
    htmTotal: number,
    equipmentRentalTotal: number,
    vehicleTotal: number,
    discountTotal: number,
    grandTotal: number
  },
  renderedText: {
    packageText: string,
    addonsText: string,
    whatsappMessage: string
  },
  source: "website"
}
```

Value seperti `pkg_konten_2p`, `Kursi Lipat`, atau `290000` bukan default schema. Itu hanya contoh hasil akhir setelah customer memilih paket atau tambahan.

Contoh item hasil pilihan customer:

```js
[
  {
    itemId: "pkg_konten_2p",
    type: "package",
    category: "tent_package",
    name: "Paket Konten 2P",
    quantity: 1,
    unitPrice: 290000,
    pricingType: "per_night",
    nights: 1,
    subtotal: 290000
  },
  {
    itemId: "addon_kursi_lipat",
    type: "equipment_rental",
    category: "camping_gear",
    name: "Kursi Lipat",
    quantity: 2,
    unitPrice: 20000,
    pricingType: "per_night",
    nights: 1,
    subtotal: 40000
  },
  {
    itemId: "addon_paket_grill",
    type: "equipment_rental",
    category: "grill_food",
    name: "Paket Grill",
    quantity: 1,
    unitPrice: 130000,
    pricingType: "flat",
    nights: null,
    subtotal: 130000
  }
]
```

`items` bukan hanya untuk paket tenda. Semua komponen biaya masuk ke array yang sama supaya dashboard, payment, report, dan inventory bisa membaca data yang konsisten.

Tipe item yang perlu didukung:

- `package` untuk paket tenda seperti Paket Lengkap, Konten, Fullset, dan Bawa Tenda Sendiri.
- `equipment_rental` untuk semua tambahan di luar paket utama, termasuk sleeping bag, matras, kursi lipat, meja, kompor, kabel roll, nesting, tripod, grill, kayu bakar, extra sosis, daging slice, ayam fillet, dan tambahan lainnya.
- `htm` untuk tiket masuk.
- `flysheet` untuk flysheet otomatis atau manual.
- `vehicle` untuk biaya kendaraan jika nanti diterapkan.
- `discount` untuk potongan harga atau adjustment manual jika nanti dibutuhkan.

Jika perlu pemisahan tampilan, gunakan field `category`, misalnya `camping_gear`, `grill_food`, atau `utility`, tanpa membuat `type` baru.

Tasks:

- Ubah logic form supaya membuat `items` terstruktur.
- Pastikan paket tenda dan tambahan sewa alat sama-sama masuk ke `items`, tetapi dibedakan lewat `type`.
- Tetap generate `packageText`, `addonsText`, dan WhatsApp message dari structured data.
- Pastikan invoice detail di frontend membaca data structured jika tersedia.
- Buat fallback untuk data lama yang masih memakai `paketText` dan `addonsText`.

Output:

- Reservasi siap dipakai untuk dashboard detail, laporan, payment, dan inventory.

## 6. Phase 3 — Pricing Engine

Tujuan:

Memindahkan logic kalkulasi harga dari komponen React ke module khusus.

File yang direkomendasikan:

- `src/lib/pricing/calculateNights.js`
- `src/lib/pricing/calculateReservationTotal.js`
- `src/lib/pricing/buildReservationItems.js`
- `src/lib/pricing/formatReservationText.js`
- `src/lib/pricing/areaRules.js`

Rules yang perlu ditangani:

- Paket Lengkap sudah termasuk HTM sesuai pax.
- Paket Konten dan Fullset belum termasuk HTM.
- Bawa Tenda Sendiri memakai HTM khusus.
- Flysheet otomatis masuk untuk paket tertentu.
- Flysheet bisa dihapus dengan warning.
- **Harga Sewa Alat (Tenda, Matras, Sleeping Bag, dll) wajib dikalikan jumlah malam (`nights`).**
- **Harga Add-on Food/Grill (Paket Grill, Kayu Bakar, Daging, dll) bersifat flat per kuantitas (tidak dikali jumlah malam).**
- Add-on bisa bertipe flat atau per malam.
- Durasi dihitung berdasarkan check-in dan check-out.
- Paket 4P hanya boleh di area tertentu.
- Weekend rule untuk Campervan dan Area 8.
- Area tertentu direkomendasikan untuk paket tertentu.
- Kapasitas tenda harus cukup untuk jumlah peserta.

Functions yang dibutuhkan:

```js
calculateNights(checkin, checkout)
isWeekendStay(checkin, checkout)
validateAreaPackageRules(area, packages, dateRange)
validateCapacity(guests, selectedPackages)
buildReservationItems(input)
calculateReservationTotal(input)
formatWhatsAppMessage(reservation)
```

Output:

- Pricing lebih mudah dites.
- Form reservasi lebih bersih.
- Perubahan harga dan rules lebih aman.

## 7. Phase 4 — Backend API Setup & Contract

Tujuan:

Menginisiasi *Backend API* menggunakan Node.js, Express, dan Prisma SQLite agar frontend memiliki tempat penyimpanan data nyata (MVP).

API customer:

```txt
POST /api/reservations
GET /api/reservations/:invoiceId
```

API admin:

```txt
POST /api/admin/login
GET /api/admin/overview
GET /api/admin/reservations
GET /api/admin/reservations/:invoiceId
PATCH /api/admin/reservations/:invoiceId/status
```

API pricing lanjutan:

```txt
GET /api/price-items
GET /api/packages
POST /api/admin/price-items
PATCH /api/admin/price-items/:id
POST /api/admin/packages
PATCH /api/admin/packages/:id
```

API payment lanjutan:

```txt
POST /api/payments/:reservationId/upload-proof
GET /api/admin/payments
PATCH /api/admin/payments/:paymentId/verify
PATCH /api/admin/payments/:paymentId/reject
```

Output:

- Frontend dan backend punya kontrak jelas.
- Development frontend bisa lanjut dengan mock API kalau backend belum siap.

## 8. Phase 5 — Dashboard Admin MVP (React + Golang API)

> [!IMPORTANT]
> **User Review Required:** Mohon review rencana arsitektur Dashboard Admin di bawah ini. Kita akan membuang file HTML lama dan membangun ulang semuanya menggunakan React (Vite) agar tersambung sempurna dengan keamanan JWT di Golang.

Tujuan:
Membuat sistem manajemen admin (Dashboard) yang *secure* (dilindungi JWT) dan terintegrasi dengan database Supabase secara *real-time*.

### Backend (Golang API Updates)
Kita perlu menambahkan *endpoints* berikut di dalam rute terproteksi (`/api/admin`):
- `GET /api/admin/overview` -> Mengembalikan statistik (Total Reservasi, Menunggu Konfirmasi, Estimasi Pendapatan, Tamu).
- `GET /api/admin/reservations` -> Mengembalikan daftar lengkap semua reservasi dari Supabase.
- `PATCH /api/admin/reservations/:invoiceId/status` -> Untuk mengubah status reservasi (misal: "Pending" menjadi "Confirmed").

### Frontend (React Migrations)
Kita akan membuat folder `src/pages/admin/` yang berisi:
- **`Login.jsx`**: Form login yang akan memanggil `POST /api/admin/login` dan menyimpan token JWT ke `localStorage`.
- **`DashboardLayout.jsx`**: *Wrapper* halaman admin yang berisi *Sidebar* dan *Topbar*. Juga berfungsi sebagai penjaga rute (hanya bisa diakses jika ada token JWT).
- **`Overview.jsx`**: Halaman utama (*Index*) yang menampilkan 4 kotak statistik dan tabel "Reservasi Terbaru".
- **`Reservations.jsx`**: Halaman daftar reservasi lengkap dengan fitur ubah status (Dropdown Status).

### Verification Plan
1. **Automated/Manual Tests**:
   - Saya akan mencoba login dengan kredensial Admin (via API).
   - Memastikan token JWT tersimpan dan dikirim di setiap *request* `fetch`.
   - Mengubah status reservasi (dari *Menunggu Konfirmasi* menjadi *Confirmed*) dan memastikan perubahan tersimpan ke Supabase.

## 9. Phase 6 — Price Master

Tujuan:

Menghilangkan kebutuhan edit source code setiap kali harga berubah.

Page admin yang dibutuhkan:

- `Price Master`

Fields:

- Item name
- Category
- Unit price
- Pricing type
- Active status
- Visibility
- Label
- Notes

Category:

- HTM
- Paket
- Sewa alat
- Add-on makanan
- Kendaraan
- Seasonal

Pricing type:

- `flat`
- `per_night`
- `per_person`
- `per_booking`

Tasks:

- Buat list price item.
- Buat create/edit price item.
- Tambah hide/show item.
- Tambah label:
  - Best Seller
  - Recommended
  - Hidden
  - Seasonal
- Frontend reservation mengambil harga dari API.
- Tambah fallback seed data jika API gagal pada development.

Output:

- Harga bisa diubah dari dashboard.
- Form reservasi tidak bergantung pada hardcoded price.

## 10. Phase 7 — Package Management

Tujuan:

Membuat paket bisa dikonfigurasi dari dashboard.

Data package minimal:

```js
{
  id: "",
  name: "",
  description: "",
  capacity: 2,
  basePrice: 0,
  htmPolicy: "included",
  htmIncludedPax: 2,
  active: true,
  visible: true,
  labels: ["recommended"],
  items: [
    {
      priceItemId: "",
      quantity: 1,
      included: true
    }
  ]
}
```

Tasks:

- Buat halaman package list.
- Buat create/edit package.
- Hubungkan package dengan price items.
- Tambah active/inactive package.
- Tambah seasonal package.
- Frontend packages page membaca data package dari API.
- Reservation form membaca data package dari API.

Output:

- Paket bisa diubah tanpa deploy ulang frontend.

## 11. Phase 8 — Payment Preproduction

Tujuan:

Membuat flow pembayaran manual transfer BCA sesuai PRD.

Customer flow:

1. Customer submit reservasi.
2. Customer mendapat invoice.
3. Customer masuk ke halaman instruksi pembayaran.
4. Customer upload bukti transfer.
5. Status payment menjadi `Payment Uploaded`.
6. Admin verify atau reject.

Page customer:

- `/payment/:invoiceId`
- `/payment/success`

Dashboard admin:

- Payment list
- Payment detail
- Verify payment
- Reject payment dengan alasan

Payment statuses:

- `Waiting Payment`
- `Payment Uploaded`
- `Verified`
- `Rejected`

Reservation statuses terkait:

- `Menunggu Konfirmasi`
- `Waiting Payment`
- `Payment Uploaded`
- `Confirmed`
- `Cancelled`

Output:

- Customer bisa lanjut dari reservasi ke pembayaran.
- Admin punya flow verifikasi pembayaran.

## 12. Phase 9 — Calendar Reservation

Tujuan:

Membantu admin melihat kepadatan booking berdasarkan tanggal dan area.

Features:

- Calendar monthly view.
- Filter by area.
- Filter by status.
- Klik tanggal untuk lihat reservasi.
- Color status:
  - pending
  - waiting payment
  - confirmed
  - cancelled
  - checked in
- Warning tanggal penuh.

Lanjutan:

- Blok tanggal tertentu.
- Admin bisa set unavailable date.
- Customer form bisa menolak tanggal penuh.

Output:

- Admin bisa melihat okupansi dan jadwal operasional.

## 13. Phase 10 — Inventory Management

Tujuan:

Menghitung kebutuhan alat berdasarkan reservation items.

Inventory master:

- Item name
- Total stock
- Unit
- Active status
- Notes

Inventory usage:

- Reservation ID
- Item ID
- Quantity
- Date range
- Status

Rules:

- Confirmed reservation mengunci stok.
- Cancelled reservation melepas stok.
- Pending bisa masuk sebagai soft hold jika diperlukan.
- Jika stok kurang, admin dan customer mendapat warning.

Features:

- List stok alat.
- Stok tersedia per tanggal.
- Stok terpakai per reservation.
- Warning shortage.

Output:

- Tim lapangan tahu alat yang harus disiapkan.
- Admin bisa mencegah overbooking alat.

## 14. Phase 11 — Reports

Tujuan:

Memberi admin laporan operasional dan revenue.

Reports:

- Daily report
- Weekly report
- Monthly report
- Revenue report
- Reservation status summary
- Area occupancy
- Popular package
- Add-on usage
- Repeat customer

Export:

- CSV
- PDF later if needed

Output:

- Admin bisa membaca performa bisnis dan operasional.

## 15. Suggested File Structure

Struktur project keseluruhan yang direkomendasikan:

```txt
/e-RHCG
  ├── backend/
  │    ├── server.js            (Entry point API & Express)
  │    ├── prisma/
  │    │    └── schema.prisma   (Definisi tabel database SQLite)
  │    ├── routes/
  │    │    ├── reservations.js (Endpoint submit & cek)
  │    │    └── admin.js        (Endpoint dashboard & login)
  │    └── utils/
  ├── src/
  │    ├── components/
  │    ├── pages/
  │    ├── data/
  │    │    packages.js
  │    │    addons.js
  │    │    areas.js
  │    │    pricingRules.js
  │    ├── lib/
  │    │    api.js
  │    │    config.js
  │    │    pricing/
  │    │      calculateNights.js
  │    │      calculateReservationTotal.js
  │    │      buildReservationItems.js
  │    │      formatReservationText.js
  │    │      areaRules.js
  ├── pages/dashboard/          (Admin HTML statis MVP)
```

Jika dashboard dimigrasikan ke React:

```txt
src/
  admin/
    AdminApp.jsx
    pages/
      Login.jsx
      Overview.jsx
      Reservations.jsx
      ReservationDetail.jsx
      PriceMaster.jsx
      PackageManagement.jsx
      Payments.jsx
      Calendar.jsx
      Inventory.jsx
```

## 16. MVP Priority Order

Urutan implementasi yang paling disarankan:

1. Buat API config dan helper.
2. Pindahkan data package/addon/area dari JSX ke data module.
3. Pisahkan pricing engine dari komponen.
4. Ubah reservation payload menjadi structured.
5. Sambungkan submit reservation ke API.
6. Sambungkan check reservation ke API.
7. Sambungkan dashboard login ke API.
8. Sambungkan dashboard reservation list dan update status ke API.
9. Tambah payment instruction dan upload proof.
10. Tambah price master.
11. Tambah package management.
12. Tambah calendar.
13. Tambah inventory.
14. Tambah report.

## 17. Fast MVP Scope

Jika ingin cepat live, ambil scope ini dulu:

- Landing page final.
- Gallery dan area final.
- Form reservasi final.
- Submit reservasi ke backend.
- Generate invoice.
- Redirect WhatsApp.
- Cek invoice.
- Admin login.
- Admin list reservation.
- Admin detail reservation.
- Admin update status.

Yang ditunda:

- Price master.
- Package management.
- Payment upload.
- Calendar.
- Inventory.
- Report.

## 18. Risks

Risiko utama:

- Harga masih hardcoded terlalu lama.
- Payload berbasis string menyulitkan dashboard dan report.
- Login mock tidak aman jika terbawa production.
- Hardcoded API URL menyulitkan deploy.
- Dashboard vanilla JS akan makin sulit dirawat jika fitur admin makin banyak.
- Tidak ada backend di repo ini, sehingga frontend tidak bisa benar-benar verified end-to-end.

Mitigasi:

- Prioritaskan structured reservation payload.
- Prioritaskan API helper dan environment variable.
- Pisahkan pricing engine.
- Buat backend contract sebelum implement fitur lanjutan.
- Pertimbangkan migrasi dashboard ke React setelah MVP admin stabil.

## 19. Definition of Done

MVP dianggap selesai jika:

- Customer bisa submit reservasi dari website.
- Sistem membuat invoice ID.
- Customer bisa cek invoice.
- WhatsApp message otomatis berisi detail reservasi.
- Admin bisa login.
- Admin bisa melihat semua reservasi.
- Admin bisa melihat detail reservasi.
- Admin bisa mengubah status reservasi.
- Build frontend berhasil tanpa error.
- Flow utama diuji di mobile dan desktop.

## 20. Immediate Next Step

Langkah teknis pertama yang paling ideal:

1. Buat `src/lib/api.js`.
2. Buat `.env.example`.
3. Pindahkan `packageDefs`, `addonDefs`, dan `paketDetails` dari `Reservation.jsx` ke `src/data`.
4. Pisahkan kalkulasi harga ke `src/lib/pricing`.
5. Pastikan hasil UI tetap sama setelah refactor.
