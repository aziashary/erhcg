-- Tabel Users (Untuk Admin Login)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabel Reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT UNIQUE,
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_wa TEXT NOT NULL,
    customer_email TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INTEGER NOT NULL,
    pax_adult INTEGER NOT NULL,
    pax_child INTEGER DEFAULT 0,
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_type TEXT,
    paid_amount BIGINT DEFAULT 0,
    items_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabel Reservation Items
CREATE TABLE reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL
);

-- Insert 1 Akun Admin Default (Email: admin@rockshill.com | Password akan diset lewat backend nanti)
INSERT INTO users (email, password_hash) VALUES ('admin@rockshill.com', 'nanti_diupdate_via_backend');
