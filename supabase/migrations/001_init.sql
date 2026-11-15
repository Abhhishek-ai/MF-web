create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ===== ADMIN =====
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ===== SETTINGS (owner-editable key/value JSON) =====
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ===== TAXONOMY =====
create table public.product_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  group_id uuid references public.product_groups(id) on delete set null,
  description text not null default '',
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_megh boolean not null default false,
  is_public boolean not null default true,     -- owner can hide any partner brand name from the public site
  logo_url text,
  sort_order int not null default 0
);

-- ===== PRODUCTS (one page per product) + PACKS (one row per catalogue SKU / carton configuration) =====
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  group_id uuid references public.product_groups(id) on delete set null,
  is_megh_brand boolean not null default false,
  short_description text not null default '',
  description_md text not null default '',
  ingredients text,
  shelf_life text,
  hs_code text,
  origin text not null default 'India',
  dietary_tags text[] not null default '{}',
  images text[] not null default '{}',          -- first = cover
  catalogue_pages text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  needs_review boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_group_idx on public.products(group_id);
create index products_category_idx on public.products(category_id);
create index products_brand_idx on public.products(brand_id);
create index products_active_idx on public.products(is_active);
create index products_name_trgm on public.products using gin (name gin_trgm_ops);
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

create table public.product_packs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,                      -- e.g. MF-0123
  pack_size text,                                -- "2LB", "400G", "750ML"
  units_per_carton int,
  carton_spec_raw text,                          -- for items without a parsable pack, e.g. "18X12"
  pack_size_grams numeric,
  pack_size_ml numeric,
  india_mrp_pack boolean not null default false,
  original_listing text,
  review_flags text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0
);
create index packs_product_idx on public.product_packs(product_id);

-- ===== ENQUIRIES (requests for quote) =====
create type public.enquiry_status as enum ('new','in_progress','quoted','won','lost','spam');
create sequence public.enquiry_seq start 1001;

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('EN-' || nextval('public.enquiry_seq')::text),
  full_name text not null,
  company text,
  email text not null,
  phone text,
  country text not null,
  city text,
  buyer_type text,                                -- Importer / Distributor / Retailer / Other
  shipping_terms text,                            -- EXW / FOB / CIF / CFR / Not sure
  container_pref text,                            -- FCL / LCL-mixed / Not sure
  message text,
  status public.enquiry_status not null default 'new',
  internal_notes text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger enquiries_updated_at before update on public.enquiries for each row execute function public.set_updated_at();

create table public.enquiry_items (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  pack_id uuid references public.product_packs(id) on delete set null,
  sku text not null,
  product_name text not null,
  brand_name text,
  pack_size text,
  units_per_carton int,
  quantity_cartons int not null check (quantity_cartons > 0)
);
create index enquiry_items_enquiry_idx on public.enquiry_items(enquiry_id);

create table public.enquiry_throttle (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index enquiry_throttle_idx on public.enquiry_throttle(ip_hash, created_at);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  filename text,
  total_rows int,
  created_products int, updated_products int, created_packs int, updated_packs int,
  errors jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- ===== RLS =====
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.product_groups enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_packs enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_items enable row level security;
alter table public.enquiry_throttle enable row level security;
alter table public.import_jobs enable row level security;

create policy "admins read admin_users" on public.admin_users for select to authenticated using (public.is_admin());

create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin write settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read groups" on public.product_groups for select to anon, authenticated using (is_active);
create policy "admin all groups" on public.product_groups for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read categories" on public.categories for select to anon, authenticated using (is_active);
create policy "admin all categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read brands" on public.brands for select to anon, authenticated using (is_public or is_megh);
create policy "admin all brands" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read products" on public.products for select to anon, authenticated using (is_active);
create policy "admin all products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read packs" on public.product_packs for select to anon, authenticated
  using (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "admin all packs" on public.product_packs for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- enquiries / items / throttle / imports: NO public access. Inserts happen only in server actions with the service-role key.
create policy "admin all enquiries" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all enquiry_items" on public.enquiry_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin read imports" on public.import_jobs for select to authenticated using (public.is_admin());

-- ===== STORAGE =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('product-images','product-images', true, 5242880, array['image/webp','image/jpeg','image/png']),
 ('documents','documents', true, 52428800, array['application/pdf'])
on conflict (id) do nothing;
create policy "public read product images" on storage.objects for select using (bucket_id in ('product-images','documents'));
create policy "admin insert storage" on storage.objects for insert to authenticated with check (bucket_id in ('product-images','documents') and public.is_admin());
create policy "admin update storage" on storage.objects for update to authenticated using (bucket_id in ('product-images','documents') and public.is_admin());
create policy "admin delete storage" on storage.objects for delete to authenticated using (bucket_id in ('product-images','documents') and public.is_admin());

-- ===== SEED =====
insert into public.product_groups (name, slug, sort_order, description) values
 ('Food Staples','food-staples',1,'Flours, pulses, rice, spices, jaggery, salt, sugar and fasting (farali) essentials.'),
 ('Snacks & Ready-to-Eat','snacks-ready-to-eat',2,'Papad, wafers, chevda, farsan, mukhvas and ready-to-eat snacks.'),
 ('Partner Brands','partner-brands',3,'Popular Indian FMCG brands for one-stop container sourcing.'),
 ('Sweets & Mithai','sweets-mithai',4,'Traditional Indian sweets, chikki, laddu and shrikhand.'),
 ('Pooja & Festival','pooja-festival',5,'Pooja essentials, brassware, diyas, rangoli and festival décor.'),
 ('Handicraft & Home Decor','handicraft-home-decor',6,'Handmade temples, idols, clay cookware and home decor.'),
 ('Sports Goods','sports-goods',7,'Carrom, cricket and other sports goods.');

insert into public.site_settings (key, value) values
 ('company', '{"name":"Megh Overseas Private Limited","brand":"Megh Foods","cin":"U51900GJ2014PTC079988","registered_office":"A-43 Aditya Residency, Nr. Thaltej Fire Station, Zydus Hospital Road, Thaltej, Ahmedabad - 380059, Gujarat, India","factory":"Shed No. 6, Marutinandan Estate, Tajpur Road, Changodar, Ahmedabad - 382213, Gujarat, India","phones":["+91 989 825 5500","+1 469 608 9613"],"email":"info@meghfoods.com","website":"www.meghfoods.com"}'),
 ('whatsapp', '{"number":"919898255500"}'),
 ('markets', '["United States","European Union","Middle East","Africa"]'),
 ('certifications', '[]'),
 ('catalogue', '{"pdf_url":null,"label":"Export Product Catalogue","updated":"November 2026"}'),
 ('features', '{"show_partner_brands":true,"enable_checkout":false}');
