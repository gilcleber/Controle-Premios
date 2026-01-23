-- Migration: Add multi-tenant support to existing tables
-- Description: Adiciona radio_station_id às tabelas existentes

-- 1. Adicionar coluna radio_station_id em prizes
ALTER TABLE prizes 
ADD COLUMN IF NOT EXISTS radio_station_id UUID REFERENCES radio_stations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS source_master_id UUID REFERENCES master_inventory(id) ON DELETE SET NULL;

-- Index para prizes
CREATE INDEX IF NOT EXISTS idx_prizes_radio_station ON prizes(radio_station_id);
CREATE INDEX IF NOT EXISTS idx_prizes_source_master ON prizes(source_master_id);

-- Comentários prizes
COMMENT ON COLUMN prizes.radio_station_id IS 'Estação de rádio à qual este prêmio pertence';
COMMENT ON COLUMN prizes.source_master_id IS 'Item do estoque central de onde veio este prêmio';

-- 2. Adicionar coluna radio_station_id em outputs (saídas)
ALTER TABLE outputs 
ADD COLUMN IF NOT EXISTS radio_station_id UUID REFERENCES radio_stations(id) ON DELETE CASCADE;

-- Index para outputs
CREATE INDEX IF NOT EXISTS idx_outputs_radio_station ON outputs(radio_station_id);

-- Comentários outputs
COMMENT ON COLUMN outputs.radio_station_id IS 'Estação de rádio à qual esta saída pertence';

-- 3. Adicionar coluna radio_station_id em programs
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS radio_station_id UUID REFERENCES radio_stations(id) ON DELETE CASCADE;

-- Index para programs
CREATE INDEX IF NOT EXISTS idx_programs_radio_station ON programs(radio_station_id);

-- Comentários programs
COMMENT ON COLUMN programs.radio_station_id IS 'Estação de rádio à qual este programa pertence';
