-- =============================================
-- MELHORIAS DE ARQUITETURA: SISTEMA DE CASAIS, ORÇAMENTOS E CATEGORIAS
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. TABELA DE CASAIS (GRUPOS)
CREATE TABLE IF NOT EXISTS couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR couple_id NAS TABELAS EXISTENTES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);
ALTER TABLE goals ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);

-- 3. TABELA DE CATEGORIAS PERSONALIZADAS
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id), -- NULL se for categoria padrão do sistema
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE ORÇAMENTOS (BUDGETS)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id) NOT NULL,
    category TEXT NOT NULL, -- Pode ser FK para categories depois
    amount DECIMAL(12, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(couple_id, category, month, year)
);

-- 5. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE RLS ATUALIZADAS (ISOLAMENTO POR CASAL)

-- Função auxiliar para pegar o couple_id do usuário atual
CREATE OR REPLACE FUNCTION get_my_couple_id()
RETURNS UUID AS $$
    SELECT couple_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- COUPLES: Usuário pode ver o casal ao qual pertence
CREATE POLICY "Users can view their own couple" ON couples
    FOR SELECT TO authenticated USING (id = get_my_couple_id());

-- CATEGORIES: Ver padrões (couple_id IS NULL) ou as do próprio casal
CREATE POLICY "Users can view categories" ON categories
    FOR SELECT TO authenticated USING (couple_id IS NULL OR couple_id = get_my_couple_id());

CREATE POLICY "Users can insert categories" ON categories
    FOR INSERT TO authenticated WITH CHECK (couple_id = get_my_couple_id());

-- BUDGETS: Ver e gerenciar orçamentos do casal
CREATE POLICY "Users can view budgets" ON budgets
    FOR SELECT TO authenticated USING (couple_id = get_my_couple_id());

CREATE POLICY "Users can manage budgets" ON budgets
    FOR ALL TO authenticated USING (couple_id = get_my_couple_id());

-- ATUALIZAR POLÍTICAS EXISTENTES PARA FILTRAR POR couple_id
-- Exemplo para transactions (repetir lógica para goals, bills, shopping_items)

DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON transactions;
CREATE POLICY "Users can view couple transactions" ON transactions
    FOR SELECT TO authenticated USING (couple_id = get_my_couple_id());

CREATE POLICY "Users can manage couple transactions" ON transactions
    FOR ALL TO authenticated USING (couple_id = get_my_couple_id());

-- GOALS
DROP POLICY IF EXISTS "Authenticated users can view all goals" ON goals;
CREATE POLICY "Users can view couple goals" ON goals
    FOR SELECT TO authenticated USING (couple_id = get_my_couple_id());

CREATE POLICY "Users can manage couple goals" ON goals
    FOR ALL TO authenticated USING (couple_id = get_my_couple_id());

-- BILLS
DROP POLICY IF EXISTS "Authenticated users can view all bills" ON bills;
CREATE POLICY "Users can view couple bills" ON bills
    FOR SELECT TO authenticated USING (couple_id = get_my_couple_id());

CREATE POLICY "Users can manage couple bills" ON bills
    FOR ALL TO authenticated USING (couple_id = get_my_couple_id());

-- SHOPPING ITEMS
DROP POLICY IF EXISTS "Authenticated users can view all shopping items" ON shopping_items;
CREATE POLICY "Users can view couple shopping items" ON shopping_items
    FOR SELECT TO authenticated USING (couple_id = get_my_couple_id());

CREATE POLICY "Users can manage couple shopping items" ON shopping_items
    FOR ALL TO authenticated USING (couple_id = get_my_couple_id());

-- Trigger para preencher couple_id automaticamente ao inserir dados
CREATE OR REPLACE FUNCTION set_couple_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.couple_id := (SELECT couple_id FROM profiles WHERE id = auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger em todas as tabelas
CREATE TRIGGER tr_set_couple_id_transactions BEFORE INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION set_couple_id_on_insert();
CREATE TRIGGER tr_set_couple_id_goals BEFORE INSERT ON goals FOR EACH ROW EXECUTE FUNCTION set_couple_id_on_insert();
CREATE TRIGGER tr_set_couple_id_bills BEFORE INSERT ON bills FOR EACH ROW EXECUTE FUNCTION set_couple_id_on_insert();
CREATE TRIGGER tr_set_couple_id_shopping BEFORE INSERT ON shopping_items FOR EACH ROW EXECUTE FUNCTION set_couple_id_on_insert();
