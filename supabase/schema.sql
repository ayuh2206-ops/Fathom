-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations Table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  subscription_plan text default 'scout', -- scout, navigator, admiral
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users Table (Custom Auth)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  password_hash text not null,
  full_name text,
  role text default 'member', -- owner, admin, member, viewer
  organization_id uuid references public.organizations(id) on delete set null,
  email_verified timestamp with time zone,
  verification_token text,
  reset_token text,
  reset_token_expires timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vessels Table
create table public.vessels (
  id uuid default uuid_generate_v4() primary key,
  imo_number text not null unique,
  name text not null,
  type text,
  flag text,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AIS Positions Table (Time-series data)
create table public.ais_positions (
  id uuid default uuid_generate_v4() primary key,
  vessel_id uuid references public.vessels(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  speed double precision,
  status text,
  timestamp timestamp with time zone not null
);

-- Invoices Table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  invoice_number text not null,
  amount decimal(10, 2) not null,
  currency text default 'USD',
  status text default 'pending', -- pending, analyzed, disputed, paid
  organization_id uuid references public.organizations(id) on delete cascade not null,
  file_url text, -- Link to PDF in storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fraud Alerts Table
create table public.fraud_alerts (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade,
  severity text default 'medium', -- low, medium, high, critical
  type text not null, -- detention_inflation, route_deviation, duplicate_charge
  description text,
  status text default 'open', -- open, investigated, resolved, false_positive
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_users_email on public.users(email);
create index idx_vessels_org on public.vessels(organization_id);
create index idx_ais_vessel_time on public.ais_positions(vessel_id, timestamp desc);
create index idx_invoices_org on public.invoices(organization_id);
create index idx_alerts_invoice on public.fraud_alerts(invoice_id);
