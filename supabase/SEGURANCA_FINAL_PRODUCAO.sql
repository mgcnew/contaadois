-- ============================================================
-- SEGURANÇA FINAL: REABILITAR RLS COM REGRAS FUNCIONAIS
-- Execute este SQL para proteger seus dados sem perdê-los de vista
-- ============================================================

-- 1. REABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- 2. LIMPAR POLÍTICAS ANTIGAS (PARA EVITAR CONFLITOS)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS PARA TRANSAÇÕES
CREATE POLICY "transactions_select" ON transactions FOR SELECT TO authenticated 
USING (auth.uid() = created_by OR couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "transactions_insert" ON transactions FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "transactions_update" ON transactions FOR UPDATE TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "transactions_delete" ON transactions FOR DELETE TO authenticated 
USING (auth.uid() = created_by);

-- 4. POLÍTICAS PARA METAS (GOALS)
CREATE POLICY "goals_select" ON goals FOR SELECT TO authenticated 
USING (auth.uid() = created_by OR couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "goals_all" ON goals FOR ALL TO authenticated 
USING (auth.uid() = created_by);

-- 5. POLÍTICAS PARA CONTAS (BILLS)
CREATE POLICY "bills_select" ON bills FOR SELECT TO authenticated 
USING (auth.uid() = created_by OR couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "bills_all" ON bills FOR ALL TO authenticated 
USING (auth.uid() = created_by);

-- 6. POLÍTICAS PARA LISTA DE COMPRAS
CREATE POLICY "shopping_select" ON shopping_items FOR SELECT TO authenticated 
USING (auth.uid() = created_by OR couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "shopping_all" ON shopping_items FOR ALL TO authenticated 
USING (auth.uid() = created_by);

-- 7. POLÍTICAS PARA PERFIS
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 8. POLÍTICAS PARA CASAIS
CREATE POLICY "couples_select" ON couples FOR SELECT TO authenticated 
USING (id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "couples_insert" ON couples FOR INSERT TO authenticated WITH CHECK (true);
