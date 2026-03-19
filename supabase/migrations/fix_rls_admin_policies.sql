-- =============================================
-- MIGRACIÓN: Fix RLS Admin Policies
-- Fecha: 2026-03-19
-- Riesgo corregido: Privilege Escalation CRÍTICO
-- Cualquier usuario autenticado podía leer/editar
-- órdenes, productos, facturas e inventario de otros.
-- =============================================

-- PASO 1: Eliminar las políticas vulnerables
DROP POLICY IF EXISTS "Auth read all orders"     ON store_orders;
DROP POLICY IF EXISTS "Auth update orders"        ON store_orders;
DROP POLICY IF EXISTS "Auth read all order items" ON store_order_items;
DROP POLICY IF EXISTS "Auth read invoices"        ON store_invoices;
DROP POLICY IF EXISTS "Auth insert invoices"      ON store_invoices;
DROP POLICY IF EXISTS "Auth update invoices"      ON store_invoices;
DROP POLICY IF EXISTS "Auth manage products"      ON store_products;
DROP POLICY IF EXISTS "Auth manage categories"    ON store_categories;
DROP POLICY IF EXISTS "Auth manage inventory"     ON store_inventory_logs;

-- PASO 2: Crear función helper de admin
-- Devuelve true SOLO para los emails autorizados de PetfyCo
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

-- PASO 3: Crear políticas restrictivas para admin

-- store_orders: admin ve y actualiza todas; usuario solo ve las suyas
CREATE POLICY "Admin read all orders" ON store_orders
  FOR SELECT TO authenticated
  USING (is_petfyco_admin());

CREATE POLICY "Admin update orders" ON store_orders
  FOR UPDATE TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- store_order_items: admin ve todos los ítems
CREATE POLICY "Admin read all order items" ON store_order_items
  FOR SELECT TO authenticated
  USING (is_petfyco_admin());

-- store_invoices: solo admin
CREATE POLICY "Admin read invoices" ON store_invoices
  FOR SELECT TO authenticated
  USING (is_petfyco_admin());

CREATE POLICY "Admin insert invoices" ON store_invoices
  FOR INSERT TO authenticated
  WITH CHECK (is_petfyco_admin());

CREATE POLICY "Admin update invoices" ON store_invoices
  FOR UPDATE TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- store_products: solo admin puede crear/editar/eliminar
CREATE POLICY "Admin manage products" ON store_products
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- store_categories: solo admin
CREATE POLICY "Admin manage categories" ON store_categories
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- store_inventory_logs: solo admin
CREATE POLICY "Admin manage inventory" ON store_inventory_logs
  FOR ALL TO authenticated
  USING (is_petfyco_admin())
  WITH CHECK (is_petfyco_admin());

-- =============================================
-- VERIFICACIÓN (ejecutar después de la migración)
-- =============================================
-- SELECT policyname, tablename, cmd, qual
-- FROM pg_policies
-- WHERE tablename LIKE 'store_%'
-- ORDER BY tablename, policyname;
