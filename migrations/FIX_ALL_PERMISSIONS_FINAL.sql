-- SCRIPT DEFINITIVO - LIBERAR TODAS AS PERMISSÕES
-- Execute este script COMPLETO no Supabase SQL Editor

-- ==========================================
-- PARTE 1: DESABILITAR RLS TEMPORARIAMENTE
-- ==========================================

ALTER TABLE radio_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE outputs DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_history DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- PARTE 2: REMOVER TODAS AS POLICIES ANTIGAS
-- ==========================================

DO $$ 
DECLARE
    pol record;
BEGIN
    -- Radio Stations
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'radio_stations' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON radio_stations', pol.policyname);
    END LOOP;
    
    -- Prizes
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'prizes' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON prizes', pol.policyname);
    END LOOP;
    
    -- Outputs
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'outputs' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON outputs', pol.policyname);
    END LOOP;
    
    -- Programs
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'programs' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON programs', pol.policyname);
    END LOOP;
    
    -- Master Inventory
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'master_inventory' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON master_inventory', pol.policyname);
    END LOOP;
    
    -- Master Inventory Photos
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'master_inventory_photos' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON master_inventory_photos', pol.policyname);
    END LOOP;
    
    -- Distribution History
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'distribution_history' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON distribution_history', pol.policyname);
    END LOOP;
END $$;

-- ==========================================
-- PARTE 3: ADICIONAR CAMPOS FALTANTES
-- ==========================================

ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS access_pin VARCHAR(10);

ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE prizes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE outputs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Preencher campos NULL
UPDATE radio_stations SET created_at = NOW() WHERE created_at IS NULL;
UPDATE radio_stations SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE master_inventory SET created_at = NOW() WHERE created_at IS NULL;
UPDATE master_inventory SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE prizes SET created_at = NOW() WHERE created_at IS NULL;
UPDATE prizes SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE outputs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE outputs SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE programs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE programs SET updated_at = NOW() WHERE updated_at IS NULL;

-- ==========================================
-- PARTE 4: CRIAR POLICIES ABERTAS
-- ==========================================

-- Radio Stations
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_radio_stations" ON radio_stations FOR ALL USING (true) WITH CHECK (true);

-- Prizes - PERMISSÃO TOTAL
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_prizes" ON prizes FOR ALL USING (true) WITH CHECK (true);

-- Outputs
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_outputs" ON outputs FOR ALL USING (true) WITH CHECK (true);

-- Programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_programs" ON programs FOR ALL USING (true) WITH CHECK (true);

-- Master Inventory
ALTER TABLE master_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_master_inventory" ON master_inventory FOR ALL USING (true) WITH CHECK (true);

-- Master Inventory Photos
ALTER TABLE master_inventory_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_master_photos" ON master_inventory_photos FOR ALL USING (true) WITH CHECK (true);

-- Distribution History
ALTER TABLE distribution_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_distribution" ON distribution_history FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- PARTE 5: CORRIGIR FOREIGN KEYS (EVITAR CASCADE)
-- ==========================================

-- Prizes
ALTER TABLE prizes DROP CONSTRAINT IF EXISTS prizes_radio_station_id_fkey;
ALTER TABLE prizes ADD CONSTRAINT prizes_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) REFERENCES radio_stations(id) ON DELETE SET NULL;

-- Outputs
ALTER TABLE outputs DROP CONSTRAINT IF EXISTS outputs_radio_station_id_fkey;
ALTER TABLE outputs ADD CONSTRAINT outputs_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) REFERENCES radio_stations(id) ON DELETE SET NULL;

-- Programs
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_radio_station_id_fkey;
ALTER TABLE programs ADD CONSTRAINT programs_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) REFERENCES radio_stations(id) ON DELETE SET NULL;

-- ==========================================
-- PARTE 6: STORAGE (FOTOS)
-- ==========================================

-- Garantir bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-photos', 'audit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Limpar policies antigas
DROP POLICY IF EXISTS "Public can upload audit photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view audit photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete audit photos" ON storage.objects;

-- Criar policies abertas
CREATE POLICY "Public can upload audit photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'audit-photos');

CREATE POLICY "Public can view audit photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'audit-photos');

CREATE POLICY "Public can delete audit photos" ON storage.objects 
FOR DELETE USING (bucket_id = 'audit-photos');

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================

SELECT 
    tablename, 
    COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;
