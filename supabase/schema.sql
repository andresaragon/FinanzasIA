-- Esquema inicial para FinanzasIA (Supabase / Postgres)
-- Ejecutar en el SQL editor del proyecto Supabase.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  icono text,
  user_id uuid references auth.users (id) on delete cascade
);

create table if not exists category_keywords (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categories (id) on delete cascade,
  palabra text not null,
  peso integer not null default 1
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  monto numeric(12, 2) not null,
  descripcion text not null,
  categoria_id uuid references categories (id) on delete set null,
  origen text not null check (origen in ('texto', 'voz', 'foto')),
  created_at timestamptz not null default now()
);

create table if not exists user_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gasto_id uuid not null references expenses (id) on delete cascade,
  categoria_anterior uuid references categories (id),
  categoria_nueva uuid not null references categories (id),
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  categoria_id uuid not null references categories (id) on delete cascade,
  monto_limite numeric(12, 2) not null,
  mes char(7) not null -- 'YYYY-MM'
);

alter table categories enable row level security;
alter table category_keywords enable row level security;
alter table expenses enable row level security;
alter table user_corrections enable row level security;
alter table budgets enable row level security;

create policy "categorias propias o globales" on categories
  for select using (user_id is null or user_id = auth.uid());
create policy "insertar categorias propias" on categories
  for insert with check (user_id = auth.uid());

create policy "keywords legibles" on category_keywords
  for select using (true);

create policy "gastos propios" on expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "correcciones propias" on user_corrections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "presupuestos propios" on budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
