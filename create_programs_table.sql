-- Rode este script no Editor SQL do Supabase para criar a tabela de programas

create table if not exists programs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserir alguns programas padrão
insert into programs (name) values 
('Manhã Bandeirantes'),
('Esporte em Debate'),
('Jornada Esportiva'),
('Apito Final'),
('Nossa Área');

-- Política de segurança (RLS) - Opcional, mas recomendado
alter table programs enable row level security;

create policy "Todos podem ver programas ativos"
  on programs for select
  using (true);

create policy "Apenas admin pode inserir/editar/excluir"
  on programs for all
  using (true) -- Simplificado para este app, já que a autenticação é via código
  with check (true);
