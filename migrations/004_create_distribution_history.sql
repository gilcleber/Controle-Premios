-- Migration: Create distribution_history table
-- Description: Histórico de distribuição de itens para as estações

CREATE TABLE IF NOT EXISTS distribution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_inventory_id UUID NOT NULL REFERENCES master_inventory(id) ON DELETE CASCADE,
  radio_station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  prize_id TEXT REFERENCES prizes(id) ON DELETE SET NULL,  -- TEXT para compatibilidade com prizes existente
  quantity_distributed INTEGER NOT NULL CHECK (quantity_distributed > 0),
  distributed_by UUID,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dist_history_master_id ON distribution_history(master_inventory_id);
CREATE INDEX IF NOT EXISTS idx_dist_history_radio_id ON distribution_history(radio_station_id);
CREATE INDEX IF NOT EXISTS idx_dist_history_date ON distribution_history(distributed_at);

-- Habilitar RLS nesta tabela
ALTER TABLE distribution_history ENABLE ROW LEVEL SECURITY;

-- Comentários
COMMENT ON TABLE distribution_history IS 'Histórico de distribuição de itens do central para as estações';
COMMENT ON COLUMN distribution_history.prize_id IS 'Prêmio criado na estação destino (pode ser NULL se ainda não criado) - TEXT para compatibilidade';
COMMENT ON COLUMN distribution_history.distributed_by IS 'ID do usuário MASTER que fez a distribuição';

