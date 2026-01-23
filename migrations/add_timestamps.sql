-- Adicionar campos de timestamp necessários para o Supabase

-- Tabela radio_stations
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Tabela master_inventory
ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Tabela master_inventory_photos
ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE master_inventory_photos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_radio_stations_updated_at ON radio_stations;
CREATE TRIGGER update_radio_stations_updated_at
    BEFORE UPDATE ON radio_stations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_master_inventory_updated_at ON master_inventory;
CREATE TRIGGER update_master_inventory_updated_at
    BEFORE UPDATE ON master_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_master_inventory_photos_updated_at ON master_inventory_photos;
CREATE TRIGGER update_master_inventory_photos_updated_at
    BEFORE UPDATE ON master_inventory_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
