-- Run this in your Supabase SQL editor (supabase.com → SQL Editor)

create table if not exists subscribers (
  id         uuid        default gen_random_uuid() primary key,
  email      text        not null,
  countries  text[]      not null default '{}',
  created_at timestamptz default now()
);

-- Index for querying subscribers by country code
create index if not exists idx_subscribers_countries
  on subscribers using gin (countries);

-- Prevent duplicate email + country combinations
create unique index if not exists idx_subscribers_email_unique
  on subscribers (email);

-- Row level security
alter table subscribers enable row level security;

-- Anyone can subscribe (insert from the frontend)
create policy "anyone can subscribe"
  on subscribers for insert
  to anon
  with check (true);

-- Only the service role (GitHub Actions) can read
create policy "service role reads"
  on subscribers for select
  to service_role
  using (true);

-- Service role can also delete (for unsubscribe)
create policy "service role deletes"
  on subscribers for delete
  to service_role
  using (true);
