-- =============================================
-- FINANÇAS A DOIS - SCHEMA DO BANCO DE DADOS
-- Regra: Ambos veem tudo, mas só deletam o próprio
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. TABELA DE PERFIS (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE TRANSAÇÕES
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE METAS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    icon TEXT DEFAULT 'target',
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
    category TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE LISTA DE COMPRAS
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    estimated_price DECIMAL(10, 2),
    is_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HABILITAR ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS: TODOS VEEM TUDO (usuários autenticados)
-- =============================================

-- PROFILES
CREATE POLICY "Authenticated users can view all profiles" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- TRANSACTIONS
CREATE POLICY "Authenticated users can view all transactions" ON transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert transactions" ON transactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can only delete own transactions" ON transactions
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- GOALS
CREATE POLICY "Authenticated users can view all goals" ON goals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert goals" ON goals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update any goal" ON goals
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can only delete own goals" ON goals
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- BILLS
CREATE POLICY "Authenticated users can view all bills" ON bills
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert bills" ON bills
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update any bill" ON bills
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can only delete own bills" ON bills
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- SHOPPING ITEMS
CREATE POLICY "Authenticated users can view all shopping items" ON shopping_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert shopping items" ON shopping_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update any shopping item" ON shopping_items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can only delete own shopping items" ON shopping_items
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- =============================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_created_by ON goals(created_by);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_shopping_items_created_by ON shopping_items(created_by);
