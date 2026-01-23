-- Migration: Seed radio stations with fictional names
-- Description: Popula tabela com 5 estações fictícias

INSERT INTO radio_stations (name, slug, is_active) VALUES
  ('Estação Alpha', 'estacao-alpha', true),
  ('Estação Beta', 'estacao-beta', true),
  ('Estação Gamma', 'estacao-gamma', true),
  ('Estação Delta', 'estacao-delta', true),
  ('Estação Omega', 'estacao-omega', true)
ON CONFLICT (slug) DO NOTHING;

-- Comentário
COMMENT ON TABLE radio_stations IS 'Seed com 5 estações fictícias para demo/produção';
