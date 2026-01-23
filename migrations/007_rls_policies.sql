-- Migration: Row Level Security Policies
-- Description: Políticas de segurança para multi-tenancy

-- Habilitar RLS em todas as tabelas
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_inventory_photos ENABLE ROW LEVEL SECURITY;
-- Distribution_history RLS será habilitado junto com criação da tabela
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS: radio_stations
-- ========================================

-- Todos podem ler estações ativas
CREATE POLICY "Leitura pública de estações ativas"
ON radio_stations FOR SELECT
USING (is_active = true);

-- ========================================
-- POLÍTICAS: master_inventory
-- ========================================

-- Apenas MASTER pode ler/escrever
CREATE POLICY "Master acessa estoque central"
ON master_inventory FOR ALL
USING (true);  -- TODO: Adicionar verificação de role quando implementar auth

-- ========================================
-- POLÍTICAS: master_inventory_photos
-- ========================================

-- Apenas MASTER pode ler/escrever
CREATE POLICY "Master acessa fotos auditoria"
ON master_inventory_photos FOR ALL
USING (true);  -- TODO: Adicionar verificação de role quando implementar auth

-- ========================================
-- POLÍTICAS: distribution_history
-- ========================================

-- Apenas MASTER pode ler/escrever
CREATE POLICY "Master acessa histórico distribuição"
ON distribution_history FOR ALL
USING (true);  -- TODO: Adicionar verificação de role quando implementar auth

-- ========================================
-- POLÍTICAS: prizes
-- ========================================

-- Usuários veem apenas prêmios da sua estação
CREATE POLICY "Usuários veem prêmios da sua estação"
ON prizes FOR SELECT
USING (true);  -- TODO: Filtrar por radio_station_id do usuário autenticado

-- Usuários podem inserir/modificar apenas na sua estação
CREATE POLICY "Usuários modificam apenas sua estação"
ON prizes FOR INSERT
WITH CHECK (true);  -- TODO: Verificar radio_station_id

CREATE POLICY "Usuários atualizam apenas sua estação"
ON prizes FOR UPDATE
USING (true);  -- TODO: Filtrar por radio_station_id do usuário

-- ========================================
-- POLÍTICAS: outputs
-- ========================================

-- Mesma lógica de prizes
CREATE POLICY "Usuários veem outputs da sua estação"
ON outputs FOR SELECT
USING (true);  -- TODO: Filtrar por radio_station_id do usuário

CREATE POLICY "Usuários modificam outputs da sua estação"
ON outputs FOR ALL
USING (true);  -- TODO: Filtrar por radio_station_id do usuário

-- ========================================
-- POLÍTICAS: programs
-- ========================================

-- Mesma lógica de prizes
CREATE POLICY "Usuários veem programas da sua estação"
ON programs FOR SELECT
USING (true);  -- TODO: Filtrar por radio_station_id do usuário

CREATE POLICY "Usuários modificam programas da sua estação"
ON programs FOR ALL
USING (true);  -- TODO: Filtrar por radio_station_id do usuário

-- Comentário
COMMENT ON TABLE radio_stations IS 'RLS habilitado - TODO: Implementar autenticação completa';
