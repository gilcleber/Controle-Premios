-- Migration: Atribuir estação padrão aos dados existentes
-- Description: Define "Estação Alpha" como padrão para todos os registros que não têm radio_station_id

-- 1. Pegar ID da "Estação Alpha"
DO $$
DECLARE
  alpha_id UUID;
BEGIN
  -- Buscar ID da Estação Alpha
  SELECT id INTO alpha_id FROM radio_stations WHERE slug = 'estacao-alpha' LIMIT 1;

  -- Atualizar prizes sem estação
  IF alpha_id IS NOT NULL THEN
    UPDATE prizes 
    SET radio_station_id = alpha_id 
    WHERE radio_station_id IS NULL;

    -- Atualizar outputs sem estação
    UPDATE outputs 
    SET radio_station_id = alpha_id 
    WHERE radio_station_id IS NULL;

    -- Atualizar programs sem estação
    UPDATE programs 
    SET radio_station_id = alpha_id 
    WHERE radio_station_id IS NULL;

    RAISE NOTICE 'Migration concluída: estação padrão atribuída aos dados existentes';
  ELSE
    RAISE EXCEPTION 'Estação Alpha não encontrada. Execute as migrations anteriores primeiro.';
  END IF;
END $$;

-- Verificar
SELECT 'prizes' as tabela, COUNT(*) as total, COUNT(radio_station_id) as com_estacao
FROM prizes
UNION ALL
SELECT 'outputs', COUNT(*), COUNT(radio_station_id)
FROM outputs
UNION ALL
SELECT 'programs', COUNT(*), COUNT(radio_station_id)
FROM programs;
