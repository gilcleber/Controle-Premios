-- Migration: Create radio_stations table
-- Description: Cadastro de estações de rádio do grupo

CREATE TABLE IF NOT EXISTS radio_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_radio_stations_slug ON radio_stations(slug);
CREATE INDEX IF NOT EXISTS idx_radio_stations_active ON radio_stations(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_radio_stations_updated_at
    BEFORE UPDATE ON radio_stations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE radio_stations IS 'Cadastro das estações de rádio do grupo';
COMMENT ON COLUMN radio_stations.slug IS 'Identificador único URL-friendly';
COMMENT ON COLUMN radio_stations.logo_url IS 'URL do logo da estação (Supabase Storage)';
