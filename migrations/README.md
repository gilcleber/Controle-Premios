# Instruções para Rodar Migrations

## ⚠️ IMPORTANTE

Estas migrations vão **modificar** o banco de dados existente. Faça backup antes de executar!

## 📋 Passos

### 1️⃣ Acesse o Supabase SQL Editor

1. Abra o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)

### 2️⃣ Execute as Migrations **UMA POR VEZ NA ORDEM**

⚠️ **IMPORTANTE**: Copie e cole **UMA migration por vez**, aguardando o sucesso antes de passar para a próxima!

**ORDEM CORRETA:**

```sql
-- 1️⃣ PRIMEIRO: Criar radio_stations
-- Abra: migrations/001_create_radio_stations.sql
-- Copie TODO o conteúdo e cole no SQL Editor → RUN

-- 2️⃣ SEGUNDO: Criar master_inventory  
-- Abra: migrations/002_create_master_inventory.sql
-- Copie TODO o conteúdo e cole no SQL Editor → RUN

-- 3️⃣ TERCEIRO: Criar master_inventory_photos
-- Abra: migrations/003_create_master_inventory_photos.sql
-- Copie TODO o conteúdo e cole no SQL Editor → RUN

-- 4️⃣ QUARTO: Criar distribution_history
-- Abra: migrations/004_create_distribution_history.sql
-- Copie TODO o conteúdo e cole no SQL Editor → RUN

-- 5️⃣ QUINTO: Alterar tabelas existentes (adicionar radio_station_id)
-- Abra: migrations/005_alter_existing_tables.sql
-- Copie TODO o conteúdo e cole no SQL Editor → RUN

-- 6. Seed estações (Alpha, Beta, Gamma, Delta, Omega)
-- Cole o conteúdo de: migrations/006_seed_radio_stations.sql

-- 7. Configurar RLS
-- Cole o conteúdo de: migrations/007_rls_policies.sql
```

**OPÇÃO B: Script Completo**

Se preferir, cole **TODO** o conteúdo dos 7 arquivos de uma vez no SQL Editor.

### 3️⃣ Verificar Sucesso

Execute para confirmar que tudo foi criado:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estações criadas
SELECT * FROM radio_stations;

-- Ver colunas adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prizes' 
AND column_name LIKE '%radio%';
```

## ✅ Resultado Esperado

Você deve ver:
- ✅ 4 novas tabelas criadas
- ✅ 5 estações cadastradas (Alpha, Beta, Gamma, Delta, Omega)
- ✅ Colunas `radio_station_id` e `source_master_id` adicionadas em `prizes`
- ✅ RLS habilitado

## 🐛 Troubleshooting

### Erro: "relation already exists"
Alguma tabela já existe. Verifique se rodou alguma migration antes. Pode adicionar `IF NOT EXISTS` nas migrations.

### Erro: "column already exists"
A coluna já foi adicionada. Use `ADD COLUMN IF NOT EXISTS`.

### Erro: "permission denied"
Verifique se está logado como admin do projeto no Supabase.

## 🔄 Rollback (Desfazer)

Se precisar reverter:

```sql
-- Remover colunas adicionadas
ALTER TABLE prizes DROP COLUMN IF EXISTS radio_station_id;
ALTER TABLE prizes DROP COLUMN IF EXISTS source_master_id;
ALTER TABLE outputs DROP COLUMN IF EXISTS radio_station_id;
ALTER TABLE programs DROP COLUMN IF EXISTS radio_station_id;

-- Remover tabelas
DROP TABLE IF EXISTS distribution_history CASCADE;
DROP TABLE IF EXISTS master_inventory_photos CASCADE;
DROP TABLE IF EXISTS master_inventory CASCADE;
DROP TABLE IF EXISTS radio_stations CASCADE;
```

---

**Próximo Passo:** Após rodar as migrations com sucesso, volte aqui e confirme para eu continuar com a **Fase 2** (criar componentes React)! 🚀
