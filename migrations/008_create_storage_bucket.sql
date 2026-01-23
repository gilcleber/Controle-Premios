-- Script para criar Storage Bucket no Supabase
-- Execute no SQL Editor do Supabase

-- 1. Criar bucket para fotos de auditoria
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audit-photos',
  'audit-photos',
  true,  -- Público para facilitar visualização
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Storage (RLS)
-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audit-photos');

-- Todos podem visualizar fotos (bucket é público)
CREATE POLICY "Fotos são públicas para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audit-photos');

-- Apenas MASTER pode deletar
CREATE POLICY "Apenas MASTER pode deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audit-photos');
-- TODO: Adicionar verificação de role MASTER quando implementar auth

-- Verificar criação
SELECT * FROM storage.buckets WHERE id = 'audit-photos';
