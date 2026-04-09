-- Media pod kontrolą - schema MVP
create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'tenant');
create type public.utility_type as enum ('cold_water', 'hot_water', 'electricity', 'gas');
create type public.reading_status as enum ('submitted', 'approved', 'rejected');
create type public.settlement_status as enum ('draft', 'unpaid', 'paid');

create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  address text not null,
  city text not null,
  area_m2 numeric(10,2),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'tenant',
  apartment_id uuid references public.apartments(id) on delete set null,
  invitation_code text unique,
  created_at timestamptz not null default now()
);

create table public.utility_prices (
  id uuid primary key default gen_random_uuid(),
  utility_type public.utility_type not null,
  supplier_name text,
  unit_net numeric(10,4) not null,
  vat_rate numeric(5,2) not null default 23,
  unit_gross numeric(10,4) generated always as (round(unit_net * (1 + vat_rate / 100), 4)) stored,
  unit_label text not null,
  valid_from date not null,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint valid_range check (valid_to is null or valid_to >= valid_from)
);

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  reading_date date not null default current_date,
  utility_type public.utility_type not null,
  value numeric(12,2) not null,
  previous_value numeric(12,2),
  usage numeric(12,2),
  photo_path text,
  created_by uuid not null references auth.users(id) on delete cascade,
  status public.reading_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  period_month date not null,
  total_amount numeric(12,2) not null default 0,
  status public.settlement_status not null default 'draft',
  issue_date date not null default current_date,
  pdf_path text,
  created_at timestamptz not null default now(),
  unique(apartment_id, period_month)
);

create table public.settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.settlements(id) on delete cascade,
  utility_type public.utility_type not null,
  consumption numeric(12,2) not null default 0,
  unit_price numeric(12,4) not null,
  amount numeric(12,2) not null
);

-- Helper function: current user role
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_apartment_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select apartment_id from public.profiles where id = auth.uid()
$$;

-- Example monthly settlement calculation
create or replace function public.generate_monthly_settlement(
  p_apartment_id uuid,
  p_period_month date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settlement_id uuid;
  v_total numeric(12,2) := 0;
  rec record;
begin
  insert into public.settlements (apartment_id, period_month, status, issue_date)
  values (p_apartment_id, date_trunc('month', p_period_month)::date, 'draft', current_date)
  on conflict (apartment_id, period_month) do update set issue_date = excluded.issue_date
  returning id into v_settlement_id;

  delete from public.settlement_items where settlement_id = v_settlement_id;

  for rec in
    with active_prices as (
      select distinct on (utility_type)
        utility_type, unit_gross
      from public.utility_prices
      where valid_from <= (date_trunc('month', p_period_month) + interval '1 month - 1 day')::date
        and (valid_to is null or valid_to >= date_trunc('month', p_period_month)::date)
      order by utility_type, valid_from desc
    ),
    monthly_readings as (
      select utility_type, coalesce(max(usage), 0) as usage
      from public.meter_readings
      where apartment_id = p_apartment_id
        and date_trunc('month', reading_date) = date_trunc('month', p_period_month)
      group by utility_type
    )
    select
      p.utility_type,
      coalesce(m.usage, 0) as usage,
      p.unit_gross,
      round(coalesce(m.usage, 0) * p.unit_gross, 2) as amount
    from active_prices p
    left join monthly_readings m using (utility_type)
  loop
    insert into public.settlement_items (settlement_id, utility_type, consumption, unit_price, amount)
    values (v_settlement_id, rec.utility_type, rec.usage, rec.unit_gross, rec.amount);

    v_total := v_total + rec.amount;
  end loop;

  update public.settlements
  set total_amount = v_total, status = 'unpaid'
  where id = v_settlement_id;

  return v_settlement_id;
end;
$$;

-- Auto profile from auth metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, invitation_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nowy użytkownik'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'tenant'),
    new.raw_user_meta_data->>'invitation_code'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.apartments enable row level security;
alter table public.profiles enable row level security;
alter table public.utility_prices enable row level security;
alter table public.meter_readings enable row level security;
alter table public.settlements enable row level security;
alter table public.settlement_items enable row level security;

-- Profiles
create policy "admin sees all profiles"
on public.profiles for select
using (public.current_user_role() = 'admin');

create policy "user sees own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "user updates own profile"
on public.profiles for update
using (auth.uid() = id);

-- Apartments
create policy "admin sees all apartments"
on public.apartments for select
using (public.current_user_role() = 'admin');

create policy "tenant sees own apartment"
on public.apartments for select
using (id = public.current_user_apartment_id());

-- Prices
create policy "authenticated users see prices"
on public.utility_prices for select
to authenticated
using (true);

create policy "admin manages prices"
on public.utility_prices for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Meter readings
create policy "admin sees all readings"
on public.meter_readings for select
using (public.current_user_role() = 'admin');

create policy "tenant sees own apartment readings"
on public.meter_readings for select
using (apartment_id = public.current_user_apartment_id());

create policy "tenant inserts own apartment readings"
on public.meter_readings for insert
with check (
  apartment_id = public.current_user_apartment_id()
  and created_by = auth.uid()
);

create policy "admin updates readings"
on public.meter_readings for update
using (public.current_user_role() = 'admin');

-- Settlements
create policy "admin sees all settlements"
on public.settlements for select
using (public.current_user_role() = 'admin');

create policy "tenant sees own settlements"
on public.settlements for select
using (apartment_id = public.current_user_apartment_id());

create policy "admin manages settlements"
on public.settlements for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "admin sees settlement items"
on public.settlement_items for select
using (
  exists (
    select 1 from public.settlements s
    where s.id = settlement_id
      and (
        public.current_user_role() = 'admin'
        or s.apartment_id = public.current_user_apartment_id()
      )
  )
);

-- Storage bucket: meter-photos
-- after creating bucket in dashboard, add these policies manually if needed:
-- select/insert for authenticated users on folder prefix matching apartment or user strategy

-- Example seed data
insert into public.apartments (id, code, name, address, city, area_m2)
values
  ('11111111-1111-1111-1111-111111111111', '12A', 'ul. Słoneczna 15', 'ul. Słoneczna 15/12A', 'Warszawa', 42),
  ('22222222-2222-2222-2222-222222222222', '04', 'ul. Morska 2', 'ul. Morska 2/4', 'Gdańsk', 58);

insert into public.utility_prices (utility_type, supplier_name, unit_net, vat_rate, unit_label, valid_from, valid_to, is_active)
values
  ('electricity', 'TAURON', 0.7398, 23, 'PLN/kWh', '2024-01-01', null, true),
  ('cold_water', 'Wodociągi Miejskie', 11.53, 8, 'PLN/m³', '2024-01-01', null, true),
  ('hot_water', 'MPEC', 31.67, 8, 'PLN/m³', '2024-01-01', null, true),
  ('gas', 'PGNiG', 0.1789, 23, 'PLN/kWh', '2024-01-01', null, true);
