-- SQL Migration untuk CEII Coffee & Grill
-- Jalankan di Supabase SQL Editor

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_promo BOOLEAN DEFAULT false,
  promo_price INTEGER CHECK (promo_price >= 0),
  variants TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Store Settings (single row)
CREATE TABLE store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT DEFAULT '',
  telegram_username TEXT DEFAULT '',
  telegram_link TEXT DEFAULT '',
  instagram_link TEXT DEFAULT '',
  facebook_link TEXT DEFAULT '',
  store_name TEXT DEFAULT 'CEII Coffee & Grill',
  store_logo_url TEXT DEFAULT '',
  banner_promo_url TEXT DEFAULT '',
  banner_promo_active BOOLEAN DEFAULT false,
  alamat_toko TEXT DEFAULT '',
  jam_operasional TEXT DEFAULT '',
  web_user_url TEXT DEFAULT '',
  loading_media_url TEXT DEFAULT '',
  active_themes TEXT[] DEFAULT ARRAY['japanese','korean','western','cyberpunk','warung'],
  dine_in_active BOOLEAN DEFAULT true,
  store_closed BOOLEAN DEFAULT false,
  kitchen_pin TEXT DEFAULT '1234',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default store settings
INSERT INTO store_settings (store_name) VALUES ('CEII Coffee & Grill');

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL,
  nomor_meja TEXT,
  catatan TEXT,
  status TEXT DEFAULT 'baru' CHECK (status IN ('baru','diterima','dimasak','selesai')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Visits / Analytics
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now(),
  negara TEXT DEFAULT '',
  kota TEXT DEFAULT '',
  device_type TEXT DEFAULT 'HP' CHECK (device_type IN ('HP','Tablet','PC')),
  source TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  location_accuracy TEXT DEFAULT 'ip_estimate' CHECK (location_accuracy IN ('gps','ip_estimate'))
);

-- Admin Accounts
CREATE TABLE admin_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin (username: bemben gpunyakuasa, password: tapitakutistri)
-- Password hash generated with bcrypt (cost=10)
INSERT INTO admin_accounts (username, password_hash) VALUES
  ('bembengpunyakuasa', '$2b$10$mSeN7VkO/5aMC330nBBrv.V6B/IXsEFIvTP/Vot3Nb1Do8.U5ebk2');

-- Banners / Promo Popup
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  sub_teks TEXT,
  image_url TEXT DEFAULT '',
  active BOOLEAN DEFAULT false,
  tombol_aksi TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vouchers / Diskons
CREATE TABLE vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode TEXT UNIQUE NOT NULL,
  persen INTEGER CHECK (persen >= 0 AND persen <= 100),
  nominal INTEGER CHECK (nominal >= 0),
  kuota INTEGER DEFAULT 0,
  masa_berlaku DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Activity Log
CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for all tables (auth di-handle oleh custom login, bukan Supabase Auth)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;

-- Enable Realtime for all tables (for real-time sync)
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE banners;
ALTER PUBLICATION supabase_realtime ADD TABLE vouchers;

-- Seed some sample categories
INSERT INTO categories (name, icon, "order") VALUES
  ('Semua', 'menu', 0),
  ('Paket Grill', 'flame', 1),
  ('Coffee', 'coffee', 2),
  ('Non Coffee', 'cup-soda', 3),
  ('Snack', 'pizza', 4);
