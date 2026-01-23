-- MIGRATION: Adicionar Sistema de PIN por Rádio

-- 1. Adicionar coluna access_pin às estações
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS access_pin VARCHAR(10);

-- 2. Definir PIN padrão para Estação Alpha
UPDATE radio_stations 
SET access_pin = '1518' 
WHERE id = '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- 3. Gerar PINs aleatórios para outras estações (se existirem)
UPDATE radio_stations 
SET access_pin = LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE access_pin IS NULL AND is_active = true;

-- 4. Adicionar constraint (PIN não pode ser nulo para estações ativas)
-- Comentado para permitir criação de novas rádios sem PIN imediato
-- ALTER TABLE radio_stations ADD CONSTRAINT check_active_has_pin 
-- CHECK (is_active = false OR access_pin IS NOT NULL);

-- 5. Verificar resultado
SELECT id, name, slug, access_pin, is_active FROM radio_stations WHERE is_active = true;
