-- Adiciona as colunas novas na tabela de saídas (outputs)
-- Rode este script no Editor SQL do Supabase

ALTER TABLE outputs ADD COLUMN IF NOT EXISTS "programId" uuid;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS "programName" text;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'DRAW';

-- Opcional: Criar um índice para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_outputs_programId ON outputs ("programId");
