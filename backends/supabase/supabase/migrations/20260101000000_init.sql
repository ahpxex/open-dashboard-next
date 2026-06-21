-- =============================================================================
-- Supabase preset — `products` schema, RLS, and policies
-- =============================================================================
--
-- Mirrors the dashboard frontend's `src/features/products` and CONTRACT.md §0
-- exactly. Columns are snake_case (PostgREST/Supabase convention); the frontend
-- adapter (`supabaseRepository`) maps them to the camelCase product type — see
-- this preset's README "Frontend wiring" + "Column mapping" sections.
--
-- Idempotent: safe to re-run (e.g. `supabase db reset` replays every migration,
-- and a `db push` to a hosted project applies it once). Guards use IF NOT EXISTS
-- / CREATE OR REPLACE / DROP ... IF EXISTS so a re-apply is a no-op.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto. On Supabase it is normally present, but
-- enable it explicitly so this migration is self-contained on a bare Postgres.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Table: public.products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null check (length(trim(name)) > 0),
  sku         text          not null check (length(trim(sku)) > 0),
  category    text          not null check (length(trim(category)) > 0),
  price       numeric(12,2) not null default 0 check (price >= 0),
  stock       integer       not null default 0 check (stock >= 0),
  status      text          not null default 'available'
                              check (status in ('available', 'out_of_stock', 'discontinued')),
  description text          not null default '',
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- Indexes backing the contract's whitelisted sort/filter/search columns.
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx   on public.products (category);
create index if not exists products_status_idx     on public.products (status);

-- -----------------------------------------------------------------------------
-- updated_at trigger — bump on every UPDATE (CONTRACT.md §0: "bumped on every write")
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- RLS ENABLED + FORCED. With RLS on and no policy granting a role access, that
-- role is denied by default — so `anon` (and any unauthenticated PostgREST
-- request) can neither read nor write. Only the `authenticated` role (a request
-- carrying a valid Supabase Auth JWT) is granted full CRUD below.
--
-- NOTE: the `service_role` key bypasses RLS entirely (it is a superuser-like
-- key). Keep SUPABASE_SERVICE_ROLE_KEY server-side only — never ship it to the
-- browser. The frontend's data calls run inside a server fn and may use either
-- the anon key (with a forwarded user JWT) or the service-role key on the
-- trusted server hop; see the README.
alter table public.products enable row level security;
alter table public.products force row level security;

-- Drop-then-create so re-applying the migration is idempotent.
drop policy if exists "products_select_authenticated" on public.products;
drop policy if exists "products_insert_authenticated" on public.products;
drop policy if exists "products_update_authenticated" on public.products;
drop policy if exists "products_delete_authenticated" on public.products;

create policy "products_select_authenticated"
  on public.products
  for select
  to authenticated
  using (true);

create policy "products_insert_authenticated"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "products_update_authenticated"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "products_delete_authenticated"
  on public.products
  for delete
  to authenticated
  using (true);

-- Explicitly grant table privileges to the authenticated role. (RLS gates rows;
-- GRANT gates the SQL verb. PostgREST needs both.) anon gets nothing.
grant select, insert, update, delete on public.products to authenticated;
revoke all on public.products from anon;
