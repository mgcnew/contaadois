-- =============================================
-- URGENTE: Execute este SQL AGORA no Supabase
-- =============================================
-- Acesse: https://supabase.com/dashboard/project/motxlpdzcuzrfrrumjyl/sql/new
-- Cole este código e clique em RUN
-- =============================================

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 2. Se não aparecer nada acima, habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 4. Criar políticas corretas
CREATE POLICY "profiles_select_policy" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_insert_policy" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 5. Verificar se funcionou
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Você deve ver 3 políticas listadas acima
-- Se não ver, algo deu errado
