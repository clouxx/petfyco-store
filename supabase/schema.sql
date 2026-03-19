-- =============================================
-- PetfyCo Store — Supabase Schema
-- =============================================

-- Categories
CREATE TABLE IF NOT EXISTS store_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS store_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  compare_price DECIMAL(12,2),
  category_id UUID REFERENCES store_categories(id),
  images JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  weight_g INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory logs
CREATE TABLE IF NOT EXISTS store_inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES store_products(id),
  type TEXT NOT NULL CHECK (type IN ('in','out','adjustment')),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS store_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  billing_name TEXT NOT NULL,
  billing_id_type TEXT NOT NULL,
  billing_id TEXT NOT NULL,
  billing_razon_social TEXT,
  billing_email TEXT NOT NULL,
  billing_phone TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  billing_city TEXT NOT NULL,
  billing_depto TEXT NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_depto TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES store_products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS store_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES store_orders(id),
  seller_nit TEXT DEFAULT '901234567-8',
  seller_name TEXT DEFAULT 'PetfyCo S.A.S.',
  seller_address TEXT DEFAULT 'Bogotá, Colombia',
  buyer_name TEXT NOT NULL,
  buyer_id_type TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  buyer_city TEXT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_iva DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','issued','cancelled')),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter
CREATE TABLE IF NOT EXISTS store_newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_newsletter ENABLE ROW LEVEL SECURITY;

-- Public read for active categories and products
CREATE POLICY "Public read categories" ON store_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Public read products" ON store_products
  FOR SELECT USING (active = true);

-- Orders: users can read/create own orders
CREATE POLICY "Users read own orders" ON store_orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create orders" ON store_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own order items" ON store_order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM store_orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Insert order items" ON store_order_items
  FOR INSERT WITH CHECK (true);

-- Newsletter: anyone can subscribe
CREATE POLICY "Anyone subscribe newsletter" ON store_newsletter
  FOR INSERT WITH CHECK (true);

-- =============================================
-- Admin helper function
-- Returns true only for PetfyCo admin emails
-- =============================================
CREATE OR REPLACE FUNCTION is_petfyco_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (auth.jwt() ->> 'email') = ANY(
    ARRAY['fredy.alandete@gmail.com', 'f.alandete@uniandes.edu.co']
  );
$$;

-- Admin policies — SOLO emails de admin autorizados
CREATE POLICY "Admin read all orders" ON store_orders
  FOR SELECT TO authenticated USING (is_petfyco_admin());

CREATE POLICY "Admin update orders" ON store_orders
  FOR UPDATE TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin read all order items" ON store_order_items
  FOR SELECT TO authenticated USING (is_petfyco_admin());

CREATE POLICY "Admin read invoices" ON store_invoices
  FOR SELECT TO authenticated USING (is_petfyco_admin());

CREATE POLICY "Admin insert invoices" ON store_invoices
  FOR INSERT TO authenticated WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin update invoices" ON store_invoices
  FOR UPDATE TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin manage products" ON store_products
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin manage categories" ON store_categories
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin manage inventory" ON store_inventory_logs
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- =============================================
-- Seed Data — Categories
-- =============================================
INSERT INTO store_categories (name, slug, description) VALUES
  ('Nutrición', 'nutricion', 'Alimentos premium para perros y gatos'),
  ('Higiene', 'higiene', 'Productos de limpieza y aseo para mascotas'),
  ('Accesorios', 'accesorios', 'Collares, correas y más'),
  ('Juguetes', 'juguetes', 'Diversión para tus peluditos'),
  ('Salud', 'salud', 'Vitaminas, suplementos y salud preventiva'),
  ('Camas y Descanso', 'camas', 'Camas, cobijas y espacios de descanso')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Seed Data — Sample Products
-- =============================================
INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Croquetas Premium Adultos 3kg',
  'croquetas-premium-adultos-3kg',
  'Alimento balanceado de alta calidad para perros adultos. Rico en proteínas y omega 3.',
  89900, 119900,
  id,
  '["https://images.unsplash.com/photo-1601758064978-4e9c55a11fcb?w=600&h=600&fit=crop"]',
  true, true, 50, 'PFC-NUT-001'
FROM store_categories WHERE slug = 'nutricion'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Shampoo Antipulgas Profesional',
  'shampoo-antipulgas-profesional',
  'Shampoo con activos naturales para eliminar pulgas y prevenir su aparición.',
  45000, 59900,
  id,
  '["https://images.unsplash.com/photo-1607924712237-31b935de1e55?w=600&h=600&fit=crop"]',
  true, true, 30, 'PFC-HIG-001'
FROM store_categories WHERE slug = 'higiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Collar Ajustable Reflectante',
  'collar-ajustable-reflectante',
  'Collar cómodo y seguro con material reflectante para paseos nocturnos.',
  29900, NULL,
  id,
  '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop"]',
  false, true, 80, 'PFC-ACC-001'
FROM store_categories WHERE slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Juguete Kong Rellenable',
  'juguete-kong-rellenable',
  'Juguete interactivo de caucho natural resistente, ideal para rellenar con premios.',
  39900, 49900,
  id,
  '["https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&h=600&fit=crop"]',
  true, true, 25, 'PFC-JUG-001'
FROM store_categories WHERE slug = 'juguetes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Vitaminas Multivitamínico Canino',
  'vitaminas-multivitaminico-canino',
  'Suplemento vitamínico completo para mantener la salud y vitalidad de tu perro.',
  55000, NULL,
  id,
  '["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"]',
  false, true, 40, 'PFC-SAL-001'
FROM store_categories WHERE slug = 'salud'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO store_products (name, slug, description, price, compare_price, category_id, images, featured, active, stock, sku)
SELECT
  'Cama Ortopédica Luxury L',
  'cama-ortopedica-luxury-l',
  'Cama de espuma de memoria para el descanso perfecto de tu mascota. Fácil de lavar.',
  159900, 199900,
  id,
  '["https://images.unsplash.com/photo-1601758124097-ce03b5f9d7be?w=600&h=600&fit=crop"]',
  true, true, 15, 'PFC-CAM-001'
FROM store_categories WHERE slug = 'camas'
ON CONFLICT (slug) DO NOTHING;
