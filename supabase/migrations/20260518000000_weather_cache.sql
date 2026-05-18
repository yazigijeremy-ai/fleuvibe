create table if not exists weather_cache (
  id         bigint generated always as identity primary key,
  lat        numeric(8, 5) not null,
  lon        numeric(8, 5) not null,
  data       jsonb         not null,
  fetched_at timestamptz   not null default now(),
  constraint weather_cache_coord_unique unique (lat, lon)
);

create index if not exists weather_cache_fetched_at_idx on weather_cache (fetched_at);

-- Allow the edge function (service role) full access; no public access needed.
alter table weather_cache enable row level security;
