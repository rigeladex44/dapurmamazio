-- ============================================================
-- SCHEMA SUPABASE — Dapur Pedas Mama Zio POS
-- Jalankan di: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- TABEL 1: Menu Makanan & Minuman
CREATE TABLE IF NOT EXISTS menus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  price       integer NOT NULL DEFAULT 0,
  category    text NOT NULL,
  color       text NOT NULL DEFAULT 'bg-red-600',
  image       text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- TABEL 2: Transaksi Keuangan (income + expense)
CREATE TABLE IF NOT EXISTS transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type           text NOT NULL CHECK (type IN ('income','expense')),
  category       text NOT NULL,
  amount         integer NOT NULL DEFAULT 0,
  note           text DEFAULT '',
  payment_method text DEFAULT '',
  date           timestamptz DEFAULT now(),
  created_at     timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — izinkan akses publik (anon key)
-- ============================================================
ALTER TABLE menus        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: baca semua (anon + auth)
CREATE POLICY "allow_select_menus"        ON menus        FOR SELECT USING (true);
CREATE POLICY "allow_select_transactions" ON transactions FOR SELECT USING (true);

-- Policy: tulis semua (anon + auth)
CREATE POLICY "allow_insert_menus"        ON menus        FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Policy: update semua (anon + auth)
CREATE POLICY "allow_update_menus"        ON menus        FOR UPDATE USING (true);
CREATE POLICY "allow_update_transactions" ON transactions FOR UPDATE USING (true);

-- Policy: delete semua (anon + auth)
CREATE POLICY "allow_delete_menus"        ON menus        FOR DELETE USING (true);
CREATE POLICY "allow_delete_transactions" ON transactions FOR DELETE USING (true);

-- ============================================================
-- SEED DATA AWAL — Menu default Dapur Pedas Mama Zio
-- (jalankan setelah tabel dibuat)
-- ============================================================
INSERT INTO menus (name, price, category, color, image) VALUES
  ('Dimsum Ayam',      12000, 'Dimsum',        'bg-rose-500',   'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80'),
  ('Udang Keju',       12000, 'Dimsum',        'bg-amber-500',  ''),
  ('Gyoza',            12000, 'Dimsum',        'bg-orange-500', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=300&q=80'),
  ('Dimsum Mentai',    13000, 'Dimsum',        'bg-rose-600',   ''),
  ('Dimsum Bakar',     13000, 'Dimsum',        'bg-amber-600',  ''),
  ('Dimsum Kuah Creamy',13000,'Dimsum',        'bg-yellow-500', ''),
  ('Mie Level',        10000, 'Makanan',       'bg-red-600',    ''),
  ('Mie Jebew',        10000, 'Makanan',       'bg-red-700',    ''),
  ('Basreng Chili Oil',10000, 'Cemilan Gurih', 'bg-orange-600', ''),
  ('Tempura Kocek',    12000, 'Cemilan Gurih', 'bg-red-500',    ''),
  ('Pentol Oseng',     12000, 'Cemilan Gurih', 'bg-rose-700',   ''),
  ('Ceker Pedas',      10000, 'Cemilan Gurih', 'bg-red-800',    ''),
  ('Tela Tela',         5000, 'Cemilan Gurih', 'bg-yellow-600', ''),
  ('Cordog Moza',       5000, 'Cemilan Gurih', 'bg-amber-700',  ''),
  ('Cordog Sosis',      5000, 'Cemilan Gurih', 'bg-orange-700', ''),
  ('Piscok',           10000, 'Cemilan Manis', 'bg-amber-800',  ''),
  ('Pis Roll',         10000, 'Cemilan Manis', 'bg-yellow-700', ''),
  ('Pop Ice',           2000, 'Minuman',       'bg-blue-500',   ''),
  ('Teh Sisir',         1000, 'Minuman',       'bg-green-600',  '');
