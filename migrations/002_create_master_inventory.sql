-- Migration: Create master_inventory table
-- Description: Estoque central controlado pelo MASTER

CREATE TABLE IF NOT EXISTS master_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  supplier TEXT,
  total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  receipt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validity_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_quantities CHECK (available_quantity <= total_quantity)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_master_inventory_category ON master_inventory(category);
CREATE INDEX IF NOT EXISTS idx_master_inventory_supplier ON master_inventory(supplier);
CREATE INDEX IF NOT EXISTS idx_master_inventory_receipt_date ON master_inventory(receipt_date);

-- Trigger para updated_at
CREATE TRIGGER update_master_inventory_updated_at
    BEFORE UPDATE ON master_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE master_inventory IS 'Estoque central de itens recebidos (controle MASTER)';
COMMENT ON COLUMN master_inventory.category IS 'Categoria: Ingresso, Eletrônico, Alimento, etc';
COMMENT ON COLUMN master_inventory.supplier IS 'Fornecedor do item';
COMMENT ON COLUMN master_inventory.available_quantity IS 'Quantidade disponível para distribuição';
