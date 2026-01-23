-- SCRIPT DE EMERGÊNCIA - RECUPERAÇÃO E CORREÇÃO

-- ========== PARTE 1: TENTAR RECUPERAR DADOS ==========
-- IMPORTANTE: O Supabase mantém um histórico de alterações por algumas horas
-- Vá em: Dashboard > Database > Replication > Point-in-time Recovery
-- Você pode restaurar o banco para um momento ANTES de deletar as estações

-- ========== PARTE 2: CORRIGIR FOREIGN KEYS (EVITAR CASCADE) ==========

-- Remover constraints antigas que causam DELETE CASCADE
ALTER TABLE prizes DROP CONSTRAINT IF EXISTS prizes_radio_station_id_fkey;
ALTER TABLE outputs DROP CONSTRAINT IF EXISTS outputs_radio_station_id_fkey;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_radio_station_id_fkey;
ALTER TABLE master_inventory DROP CONSTRAINT IF EXISTS master_inventory_radio_station_id_fkey;
ALTER TABLE distribution_history DROP CONSTRAINT IF EXISTS distribution_history_from_station_id_fkey;
ALTER TABLE distribution_history DROP CONSTRAINT IF EXISTS distribution_history_to_station_id_fkey;

-- Recriar constraints com SET NULL (ao deletar estação, apenas remove vínculo)
ALTER TABLE prizes 
ADD CONSTRAINT prizes_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) 
REFERENCES radio_stations(id) 
ON DELETE SET NULL;

ALTER TABLE outputs 
ADD CONSTRAINT outputs_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) 
REFERENCES radio_stations(id) 
ON DELETE SET NULL;

ALTER TABLE programs 
ADD CONSTRAINT programs_radio_station_id_fkey 
FOREIGN KEY (radio_station_id) 
REFERENCES radio_stations(id) 
ON DELETE SET NULL;

-- ========== PARTE 3: RECRIAR ESTAÇÕES BÁSICAS ==========
-- Inserir as 5 estações padrão novamente (com os mesmos IDs se possível)

INSERT INTO radio_stations (id, name, slug, is_active, created_at, updated_at) 
VALUES 
  ('7353b704-d7cc-4a52-9f7f-e19acec5db73', 'Estação Alpha', 'alpha', true, NOW(), NOW()),
  ('465461b0-a15a-4533-9986-85b0b2b7601e', 'Estação Beta', 'beta', true, NOW(), NOW()),
  ('0816c068-e458-46fe-92a9-ba757936dcae', 'Estação Gamma', 'gamma', true, NOW(), NOW()),
  ('ecf9a667-cb3e-424f-8ca0-0cebf4a713fb', 'Estação Delta', 'delta', true, NOW(), NOW()),
  ('6aefd44b-eb83-492f-b90c-c1af25b55819', 'Estação Omega', 'omega', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ========== PARTE 4: VINCULAR PRÊMIOS ÓRFÃOS À ESTAÇÃO ALPHA ==========
-- Todos os prêmios que ficaram sem estação vão para Alpha
UPDATE prizes 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NULL;

UPDATE outputs 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NULL;

UPDATE programs 
SET radio_station_id = '7353b704-d7cc-4a52-9f7f-e19acec5db73'
WHERE radio_station_id IS NULL;

-- ========== PARTE 5: MODIFICAR DELETE PARA SOFT DELETE ==========
-- A partir de agora, deletar estação apenas marca como inativa

-- Esta parte será implementada no código JavaScript
-- O botão delete vai fazer UPDATE is_active = false ao invés de DELETE
