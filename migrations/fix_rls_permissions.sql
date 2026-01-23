-- Habilitar RLS mas criar policies permissivas para o modelo de login simplificado (anon key)

-- 1. Tabela radio_stations
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon Select Radio Stations" ON radio_stations;
DROP POLICY IF EXISTS "Anon Insert Radio Stations" ON radio_stations;
DROP POLICY IF EXISTS "Anon Update Radio Stations" ON radio_stations;
DROP POLICY IF EXISTS "Anon Delete Radio Stations" ON radio_stations;

CREATE POLICY "Enable read access for all users" ON radio_stations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON radio_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON radio_stations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON radio_stations FOR DELETE USING (true);

-- 2. Tabela master_inventory
ALTER TABLE master_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon All Master Inventory" ON master_inventory;

CREATE POLICY "Enable all access for master inventory" ON master_inventory FOR ALL USING (true);

-- 3. Tabela master_inventory_photos
ALTER TABLE master_inventory_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon All Master Inventory Photos" ON master_inventory_photos;

CREATE POLICY "Enable all access for master photos" ON master_inventory_photos FOR ALL USING (true);

-- 4. Garantir que outputs também esteja aberto (caso precise deletar testes lá)
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon All Outputs" ON outputs;
CREATE POLICY "Enable all access for outputs" ON outputs FOR ALL USING (true);
