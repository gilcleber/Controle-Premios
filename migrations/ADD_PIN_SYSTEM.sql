-- =============================================
-- SCRIPT COMPLETO PARA SISTEMA DE PIN
-- Execute TODO este SQL no Supabase
-- =============================================

-- 1. Adicionar coluna de PIN
ALTER TABLE radio_stations ADD COLUMN IF NOT EXISTS access_pin VARCHAR(10);

-- 2. Gerar PINs aleatórios para rádios sem PIN
UPDATE radio_stations 
SET access_pin = LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') 
WHERE access_pin IS NULL AND is_active = true;

-- 3. Verificar resultado
SELECT id, name, slug, access_pin, is_active 
FROM radio_stations 
WHERE is_active = true;
