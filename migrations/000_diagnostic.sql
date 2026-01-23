-- Script de diagnóstico: Verificar tipos das tabelas existentes
-- Execute ANTES das migrations para entender a estrutura

-- Ver tipo de ID da tabela prizes
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'prizes' 
AND column_name = 'id';

-- Ver estrutura completa de prizes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'prizes'
ORDER BY ordinal_position;

-- Ver estrutura de outputs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'outputs'
ORDER BY ordinal_position;

-- Ver estrutura de programs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'programs'
ORDER BY ordinal_position;
