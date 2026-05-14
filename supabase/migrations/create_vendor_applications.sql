-- vendor_applications table
-- Stores pending vendor applications before admin review and approval.
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

create table if not exists public.vendor_applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique not null,

  -- Step 1: Business info
  business_name   text not null,
  category        text not null,
  phone_number    text not null,
  whatsapp_number text not null,
  email           text,
  business_address text,
  instagram_handle text,
  years_in_business text,

  -- Step 2: Identity & suppliers
  owner_full_name   text not null,
  nin_number        text not null,
  id_type           text,
  supplier_name     text not null,
  supplier_relationship text,
  business_description  text not null,

  -- Step 3: Agreement & guarantor
  guarantor_name  text not null,
  guarantor_phone text not null,
  agrees_to_terms  boolean not null default false,
  agrees_to_sop    boolean not null default false,
  agrees_to_escrow boolean not null default false,

  -- Meta
  status        text not null default 'pending', -- pending | approved | rejected
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id),
  notes         text,

  created_at    timestamptz not null default now()
);

-- Index for fast status filtering (admin dashboard)
create index if not exists vendor_applications_status_idx
  on public.vendor_applications (status, submitted_at desc);

-- Allow anyone to INSERT (public form, no auth required)
alter table public.vendor_applications enable row level security;

create policy "Anyone can submit a vendor application"
  on public.vendor_applications
  for insert
  with check (true);

-- Only authenticated users (admin) can read/update
create policy "Authenticated users can view applications"
  on public.vendor_applications
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update applications"
  on public.vendor_applications
  for update
  using (auth.role() = 'authenticated');
