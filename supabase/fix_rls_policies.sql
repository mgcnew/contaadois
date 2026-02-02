-- =============================================
-- FIX: Verificar e recriar políticas RLS
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 2. Remover todas as políticas antigas
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can view all goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can insert goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can update any goal" ON goals;
DROP POLICY IF EXISTS "Users can only delete own goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can view all bills" ON bills;
DROP POLICY IF EXISTS "Authenticated users can insert bills" ON bills;
DROP POLICY IF EXISTS "Authenticated users can update any bill" ON bills;
DROP POLICY IF EXISTS "Users can only delete own bills" ON bills;
DROP POLICY IF EXISTS "Authenticated users can view all shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Authenticated users can insert shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Authenticated users can update any shopping item" ON shopping_items;
DROP POLICY IF EXISTS "Users can only delete own shopping items" ON shopping_items;

-- 3. Recriar políticas RLS corretamente

-- PROFILES
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- TRANSACTIONS
CREATE POLICY "transactions_select_policy" ON transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "transactions_insert_policy" ON transactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "transactions_update_policy" ON transactions
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "transactions_delete_policy" ON transactions
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- GOALS
CREATE POLICY "goals_select_policy" ON goals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "goals_insert_policy" ON goals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "goals_update_policy" ON goals
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "goals_delete_policy" ON goals
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- BILLS
CREATE POLICY "bills_select_policy" ON bills
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "bills_insert_policy" ON bills
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "bills_update_policy" ON bills
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "bills_delete_policy" ON bills
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- SHOPPING_ITEMS
CREATE POLICY "shopping_items_select_policy" ON shopping_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "shopping_items_insert_policy" ON shopping_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "shopping_items_update_policy" ON shopping_items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "shopping_items_delete_policy" ON shopping_items
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'goals', 'bills', 'shopping_items');

-- 5. Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
