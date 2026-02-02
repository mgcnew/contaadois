-- =============================================
-- CONFIGURAÇÃO DE STORAGE PARA AVATARES
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Criar o bucket de avatares (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acesso para o bucket de avatares
CREATE POLICY "Avatar imagens são públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem subir avatares" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'avatars');
