-- Add admin flag to profiles
alter table profiles add column if not exists is_admin boolean not null default false;

-- Spots table — data stored as JSONB so the schema never needs updating
-- when new fields are added to a spot in the JS codebase.
create table if not exists spots (
  id         bigint generated always as identity primary key,
  data       jsonb       not null,
  created_at timestamptz not null default now()
);

alter table spots enable row level security;

-- Anyone (including anonymous) can read spots
create policy "spots_public_read" on spots
  for select using (true);

-- Only admins can insert
create policy "spots_admin_insert" on spots
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Only admins can update
create policy "spots_admin_update" on spots
  for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Only admins can delete
create policy "spots_admin_delete" on spots
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
