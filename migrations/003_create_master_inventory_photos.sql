-- Migration: Create master_inventory_photos table
-- Description: Auditoria fotográfica do estoque central

CREATE TABLE IF NOT EXISTS master_inventory_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_inventory_id UUID NOT NULL REFERENCES master_inventory(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('receipt', 'product', 'package', 'other')),
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_master_photos_inventory_id ON master_inventory_photos(master_inventory_id);
CREATE INDEX IF NOT EXISTS idx_master_photos_type ON master_inventory_photos(photo_type);

-- Comentários
COMMENT ON TABLE master_inventory_photos IS 'Fotos de auditoria dos itens do estoque central';
COMMENT ON COLUMN master_inventory_photos.photo_type IS 'Tipo: receipt (nota fiscal), product (produto), package (embalagem)';
COMMENT ON COLUMN master_inventory_photos.uploaded_by IS 'ID do usuário MASTER que fez upload';
