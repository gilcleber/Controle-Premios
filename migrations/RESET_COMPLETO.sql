-- RESET COMPLETO - Executar este SQL inteiro de uma vez no Supabase

-- ========== PARTE 1: LIMPAR TUDO ==========

-- Desabilitar RLS temporariamente e remover todas as policies
ALTER TABLE radio_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE outputs DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as policies antigas (pode dar erro se não existir, ignore)
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Remover policies de radio_stations
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'radio_stations' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON radio_stations', pol.policyname);
    END LOOP;
    
    -- Remover policies de master_inventory
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'master_inventory' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON master_inventory', pol.policyname);
    END LOOP;
    
    -- Remover policies de master_inventory_photos
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'master_inventory_photos' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON master_inventory_photos', pol.policyname);
    END LOOP;
    
    -- Remover policies de outputs
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'outputs' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON outputs', pol.policyname);
    END LOOP;
END $$;

-- ========== PARTE 2: ADICIONAR CAMPOS FALTANTES ==========

-- Adicionar campos de timestamp se não existirem
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Preencher campos existentes com data atual se forem NULL
UPDATE radio_stations SET created_at = NOW() WHERE created_at IS NULL;
UPDATE radio_stations SET updated_at = NOW() WHERE updated_at IS NULL;

UPDATE master_inventory SET created_at = NOW() WHERE created_at IS NULL;
UPDATE master_inventory SET updated_at = NOW() WHERE updated_at IS NULL;

UPDATE master_inventory_photos SET created_at = NOW() WHERE created_at IS NULL;
UPDATE master_inventory_photos SET updated_at = NOW() WHERE updated_at IS NULL;

-- ========== PARTE 3: CRIAR TRIGGERS ==========

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS update_radio_stations_updated_at ON radio_stations;
DROP TRIGGER IF EXISTS update_master_inventory_updated_at ON master_inventory;
DROP TRIGGER IF EXISTS update_master_inventory_photos_updated_at ON master_inventory_photos;

-- Criar novos triggers
CREATE TRIGGER update_radio_stations_updated_at
    BEFORE UPDATE ON radio_stations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_inventory_updated_at
    BEFORE UPDATE ON master_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_inventory_photos_updated_at
    BEFORE UPDATE ON master_inventory_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========== PARTE 4: RECRIAR POLICIES (ABERTAS) ==========

-- Radio Stations - PERMISSÃO TOTAL
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_radio_stations" ON radio_stations FOR ALL USING (true) WITH CHECK (true);

-- Master Inventory - PERMISSÃO TOTAL
ALTER TABLE master_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_master_inventory" ON master_inventory FOR ALL USING (true) WITH CHECK (true);

-- Master Inventory Photos - PERMISSÃO TOTAL
ALTER TABLE master_inventory_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_master_photos" ON master_inventory_photos FOR ALL USING (true) WITH CHECK (true);

-- Outputs - PERMISSÃO TOTAL
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_outputs" ON outputs FOR ALL USING (true) WITH CHECK (true);

-- ========== PARTE 5: STORAGE (BUCKET DE FOTOS) ==========

-- Garantir que o bucket audit-photos existe e está acessível
-- (Se der erro aqui, ignore - significa que já existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-photos', 'audit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Remover policies antigas do storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view" ON storage.objects;

-- Criar policies de storage ABERTAS
CREATE POLICY "Public can upload audit photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'audit-photos');

CREATE POLICY "Public can view audit photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'audit-photos');

CREATE POLICY "Public can delete audit photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'audit-photos');
