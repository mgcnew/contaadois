-- =============================================
-- FIX: Verificar e recriar trigger de autenticação
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Verificar se a função existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Remover trigger e função existentes (se houver)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 4. Recriar a função com tratamento de erro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW; -- Continua mesmo com erro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar o trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Verificar novamente
SELECT 'Função criada!' as status, routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user'
UNION ALL
SELECT 'Trigger criado!' as status, trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
