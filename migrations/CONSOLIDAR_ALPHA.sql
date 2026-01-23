-- CONSOLIDAR TUDO NA ESTAÇÃO ALPHA
-- Execute este script no Supabase SQL Editor

-- ID da Estação Alpha
-- 7353b704-d7cc-4a52-9f7f-e19acec5db73

-- ========== PASSO 1: MOVER TODOS OS DADOS PARA ALPHA ==========

-- Mover todos os prêmios para Alpha
UPDATE prizes 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NOT NULL 
  AND radio_station_id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- Mover todos os outputs (saídas/ganhadores) para Alpha
UPDATE outputs 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NOT NULL 
  AND radio_station_id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- Mover todos os programas para Alpha
UPDATE programs 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NOT NULL 
  AND radio_station_id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- ========== PASSO 2: DELETAR OUTRAS ESTAÇÕES ==========

-- Desativar (soft delete) todas as estações exceto Alpha
UPDATE radio_stations 
SET is_active = false 
WHERE id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- Ou deletar permanentemente (escolha UMA das opções abaixo):

-- OPÇÃO A: DELETE PERMANENTE (recomendado se você não quer ver as outras nunca mais)
DELETE FROM radio_stations 
WHERE id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- OPÇÃO B: Soft Delete (apenas oculta, mas mantém no banco)
-- UPDATE radio_stations SET is_active = false WHERE id != '7353b704-d7cc-4a52-9f7f-e19acec5db73';

-- ========== PASSO 3: GARANTIR QUE ALPHA EXISTE ==========

-- Garantir que Alpha está ativa
INSERT INTO radio_stations (id, name, slug, is_active, created_at, updated_at) 
VALUES ('7353b704-d7cc-4a52-9f7f-e19acec5db73', 'Estação Alpha', 'alpha', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- ========== VERIFICAÇÃO ==========
-- Ver quantos itens ficaram em cada estação (deve mostrar tudo em Alpha)
SELECT 
  COALESCE(rs.name, 'SEM ESTAÇÃO') as estacao,
  COUNT(*) as total_premios
FROM prizes p
LEFT JOIN radio_stations rs ON p.radio_station_id = rs.id
GROUP BY rs.name
ORDER BY total_premios DESC;
