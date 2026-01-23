-- Script de diagnóstico: Verificar dados nas tabelas
-- Execute no Supabase SQL Editor para diagnosticar o problema de filtro

-- 1. Ver quantos prizes existem e se têm radio_station_id
SELECT 
  p.id,
  p.name,
  p.radio_station_id,
  rs.name as station_name,
  rs.slug as station_slug
FROM prizes p
LEFT JOIN radio_stations rs ON p.radio_station_id = rs.id
ORDER BY p.name;

-- 2. Ver quantos prizes NÃO têm estação atribuída
SELECT COUNT(*) as prizes_sem_estacao
FROM prizes
WHERE radio_station_id IS NULL;

-- 3. Ver distribuição por estação
SELECT 
  rs.name as estacao,
  COUNT(p.id) as total_prizes
FROM radio_stations rs
LEFT JOIN prizes p ON rs.id = p.radio_station_id
GROUP BY rs.id, rs.name
ORDER BY rs.name;

-- 4. Ver outputs com estações
SELECT 
  o.id,
  o."prizeName" as prize_name,
  o.radio_station_id,
  rs.name as station_name
FROM outputs o
LEFT JOIN radio_stations rs ON o.radio_station_id = rs.id
ORDER BY o.date DESC
LIMIT 20;

-- 5. Ver se migration 009 rodou corretamente
SELECT 'Prizes com estação' as tipo, COUNT(*) as total
FROM prizes WHERE radio_station_id IS NOT NULL
UNION ALL
SELECT 'Outputs com estação', COUNT(*)
FROM outputs WHERE radio_station_id IS NOT NULL
UNION ALL
SELECT 'Programs com estação', COUNT(*)
FROM programs WHERE radio_station_id IS NOT NULL;
