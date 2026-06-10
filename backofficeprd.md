# Project Brief & PRD: Rockshill Campground Admin

## 1. Project Overview
Rockshill Campground Admin is a premium, specialized management system designed for campground operations. The platform provides a high-fidelity interface for managing reservations, tracking payments, and coordinating availability with an earthy, premium aesthetic.

**Objective:** To streamline campground operations through a responsive, mobile-first administrative dashboard that handles the full reservation lifecycle.

---

## 2. Brand & Visual Identity
The system uses a custom design system characterized by "warm earthy tones" reflecting the natural campground environment.

- **Primary Color:** `#a7752a` (Golden Brown)
- **Secondary Color:** Forest Green (used for "Confirm" and "Confirmed" statuses)
- **Backgrounds:** Off-white/Cream (`#fff8ef`)
- **Typography:** Outfit (Sans-serif, modern and readable)
- **Visual Style:** Rounded corners (8px), clean card-based layouts, and soft elevations.

---

## 3. Core Features & Functional Requirements

### 3.1. Dashboard Overview
- **Analytics:** At-a-glance metrics for Total Reservations, Pending Confirmations, and Monthly Targets.
- **Action Alerts:** Urgent notifications for reservations exceeding payment deadlines.
- **Recent Activity:** Real-time feed of check-ins, payment updates, and cancellations.

### 3.2. Reservation Management
- **Pending (Belum Bayar):**
    - List of reservations awaiting payment.
    - Action: "Confirm" (Secondary color) for payment verification.
    - Options: "Reminder" and "Decline" via a secondary menu.
- **Paid (Sudah Bayar):**
    - List of confirmed bookings with "Lunas" (Paid) status.
    - Detailed tracking of guest names, dates, and areas.

### 3.3. Availability Calendar
- **Grid View:** Visual representation of campsite availability.
- **Status Indicators:** Color-coded dots (Tersedia, Terpesan, Penuh).
- **Date Detail:** Interactive date selection showing specific site status (e.g., Site A1 - Riverside).

### 3.4. Master Price List (Daftar Harga Master)
- **Catalog:** Management of accommodation (Luxury Safari Tent), food packages (BBQ Family), and facilities (ATV, Kayaking).
- **Control:** Full Create, Read, Update, Delete (CRUD) capabilities.
- **Views:** Optimized table view for desktop and card view for mobile.

---

## 4. Technical Specifications
- **Localization:** Full support for Bahasa Indonesia across all UI labels and content.
- **Responsive Design:** 
    - **Desktop:** Sidebar navigation with detailed table layouts.
    - **Mobile:** Native-app feel with a fixed bottom navigation bar (Dashboard, Belum Bayar, Sudah Bayar, Kalender, Harga).

---

## 5. Screen Inventory

### Desktop (ID)
- `{{DATA:SCREEN:SCREEN_12}}`: Ringkasan Dasbor (Overview)
- `{{DATA:SCREEN:SCREEN_9}}`: Reservasi Belum Bayar (Table View)
- `{{DATA:SCREEN:SCREEN_17}}`: Reservasi Sudah Bayar (Table View)
- `{{DATA:SCREEN:SCREEN_21}}`: Kalender Ketersediaan (Grid)
- `{{DATA:SCREEN:SCREEN_16}}`: Daftar Harga Master (Table)

### Mobile (ID)
- `{{DATA:SCREEN:SCREEN_27}}`: Ringkasan Dasbor (Mobile)
- `{{DATA:SCREEN:SCREEN_7}}`: Reservasi Belum Bayar (Mobile Cards)
- `{{DATA:SCREEN:SCREEN_18}}`: Reservasi Sudah Bayar (Mobile Cards)
- `{{DATA:SCREEN:SCREEN_26}}`: Kalender Ketersediaan (Mobile Date Picker)
- `{{DATA:SCREEN:SCREEN_4}}`: Daftar Harga Master (Mobile Cards)

---

## 6. Future Roadmap
- **New Reservation Flow:** Implementing the "Reservasi Baru" booking wizard.
- **Invoicing System:** Generating automated PDF receipts.
- **Settings & User Management:** Permissions for campground staff.