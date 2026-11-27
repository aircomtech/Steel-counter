-- Contour Steel CMS - Initial Supabase Schema & Row Level Security
-- Run this in Supabase SQL Editor (Project -> SQL Editor -> New Query)

create extension if not exists pgcrypto;

-- Helper trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 1. Site Settings (singleton key='default')
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  company_name text not null default 'Contour Steel Engineering India (P) Ltd.',
  logo_url text not null default '/contour-trademark-2026.png',
  enquiry_email text not null default 'hydsales@contoursteel.co.in',
  hero_slide_duration_ms integer not null default 5500,
  hero_stats_kicker text not null default 'Our Achievements',
  hero_stats_heading text not null default 'Steel certainty, proven at scale.',
  hero_stats jsonb not null default '[
    {"figure":"19","label":"Years Completed"},
    {"figure":"1,100+","label":"Completed Projects"},
    {"figure":"30M","label":"Sq. Ft. Delivered"}
  ]'::jsonb,
  achievements_kicker text not null default 'Milestones',
  achievements_label text not null default 'Our Achievements',
  achievements_heading text not null default '19 Years. 1,100+ Structures.',
  achievements_subheading text not null default 'Pre-Engineered Buildings (PEB) Without Compromise.',
  achievements_description text not null default 'For nearly two decades, Contour Steel has transformed complex blueprints into robust, scalable steel buildings across India. From sprawling single-floor factories to heavy-duty industrial refineries, we engineer Pre-Engineered Buildings (PEB) that push the boundaries of space, strength and structural integrity.',
  services_kicker text not null default '01',
  services_label text not null default 'What we deliver',
  services_heading text not null default 'One partner. Every critical stage.',
  why_peb_kicker text not null default '02',
  why_peb_label text not null default 'Why PEB',
  why_peb_heading text not null default 'Build faster. Expand easier. Perform longer.',
  why_peb_description text not null default 'Pre-engineered steel buildings combine factory-controlled quality with faster on-site assembly and flexible future growth.',
  why_peb_applications jsonb not null default '["Factories","Warehouses","Commercial","Convention","Institutional","Heavy Industry"]'::jsonb,
  facilities_kicker text not null default '03',
  facilities_label text not null default 'Facilities',
  facilities_heading text not null default 'Five acres equipped from design to dispatch.',
  facilities_description text not null default 'Contour Steel''s 20,234 sq. m. factory combines an automated H-beam line with CNC cutting, assembly, welding, roll forming and secondary fabrication equipment.',
  quality_kicker text not null default '04',
  quality_label text not null default 'Quality System',
  quality_heading text not null default 'Predictable quality at every stage.',
  quality_description text not null default 'Every manufactured product follows a standard inspection and testing plan. Quality is treated as a continuous process—balancing international standards with economy, buildability, functionality and sustainability.',
  quality_references_heading text not null default 'Design & fabrication references',
  projects_kicker text not null default '05',
  projects_label text not null default 'Projects',
  projects_heading text not null default 'Built across industries. Proven in the field.',
  projects_description text not null default 'A selection from Contour Steel''s original portfolio of factories, warehouses, mills, commercial facilities and specialist structures.',
  locations_kicker text not null default '06',
  locations_label text not null default 'Contact Our Team',
  locations_heading text not null default 'Our offices. Your project partners.',
  locations_description text not null default 'Connect with our Hyderabad head office or Pune branch for enquiries, project discussions and technical coordination.',
  contact_heading text not null default 'Tell us what you need to build.',
  contact_description text not null default 'Share your project location, approximate area and intended use. Our team will help shape the right next step.',
  section_visibility jsonb not null default '{
    "hero": true,
    "about": true,
    "achievements": true,
    "services": true,
    "why_peb": true,
    "facilities": true,
    "quality": true,
    "projects": true,
    "locations": true,
    "contact": true
  }'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. Navigation Items
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  is_cta boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 3. Hero Slides
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  tag text not null,
  kicker text not null,
  title text not null,
  copy text not null,
  desktop_image_url text not null,
  mobile_image_url text,
  video_url text,
  primary_cta_label text not null default 'Learn More',
  primary_cta_url text not null default '#about',
  secondary_cta_label text not null default 'Request a Quote',
  secondary_cta_url text not null default '#contact',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 4. About Sections
create table if not exists public.about_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'main',
  section_number text not null default '01',
  section_heading text not null default 'About Us',
  main_title text not null,
  description text not null,
  additional_paragraphs jsonb not null default '[]'::jsonb,
  image_url text,
  cta_text text not null default 'Discover our capabilities',
  cta_url text not null default '#capabilities',
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 5. Achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '★',
  figure text not null,
  unit text not null,
  description text not null,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 6. Milestones
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  year_label text not null,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image_url text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 7. Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  item_number text not null default '01',
  title text not null,
  description text not null,
  icon text not null default '↗',
  image_url text,
  cta_url text not null default '#contact',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 8. Why PEB Benefits
create table if not exists public.why_peb_benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 9. Facilities
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  item_number text not null default '01',
  kind text not null default 'machine' check (kind in ('hero', 'machine', 'secondary')),
  title text not null,
  subtitle text not null default '',
  description text not null,
  area_label text not null default '',
  image_url text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 10. Quality Items & Standards
create table if not exists public.quality_items (
  id uuid primary key default gen_random_uuid(),
  item_number text not null default '01',
  title text not null,
  description text not null,
  image_url text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quality_standards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null default '',
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 11. Project Categories, Projects, Project Gallery
create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references public.project_categories(id) on delete set null,
  category_name text not null default '',
  status_label text not null default 'Completed Project',
  description text not null default '',
  cover_image_url text not null,
  location text not null default '',
  area_sqft text not null default '',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_gallery (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 12. Office Locations
create table if not exists public.office_locations (
  id uuid primary key default gen_random_uuid(),
  office_type text not null,
  city text not null,
  address text not null,
  phone text not null default '',
  email text not null default '',
  map_embed_url text not null default '',
  directions_url text not null default '',
  image_url text,
  show_in_contact boolean not null default true,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 13. Contact Enquiries
create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company_name text not null default '',
  phone text not null default '',
  email text not null default '',
  project_location text not null default '',
  project_requirements text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'In Progress', 'Completed')),
  admin_notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 14. Footer Settings
create table if not exists public.footer_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  logo_url text not null default '/contour-trademark-2026.png',
  summary_text text not null default '19 years · 1,100+ projects · 30 million sq. ft.',
  company_description text not null default 'Turnkey pre-engineered steel building solutions engineered with international quality standards.',
  contact_phone text not null default '+91 91009 96655',
  contact_email text not null default 'hydsales@contoursteel.co.in',
  office_summary text not null default 'Hyderabad Head Office · Pune Branch · Seriguda Plant',
  copyright_text text not null default '© 2026 Contour Steel Engineering India (P) Ltd.',
  nav_links jsonb not null default '[
    {"label":"Facilities","url":"#facilities"},
    {"label":"Projects","url":"#projects"},
    {"label":"Locations","url":"#locations"}
  ]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 15. SEO Settings
create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  site_title text not null default 'Turnkey Pre-Engineered Steel Buildings | Contour Steel',
  meta_description text not null default 'Contour Steel engineers turnkey Pre-Engineered Buildings (PEB), industrial refineries, factories and high-performance steel buildings across India.',
  keywords text not null default 'pre-engineered buildings India, PEB manufacturer Hyderabad, turnkey steel buildings, industrial steel structures, industrial refinery steel buildings, pre-engineered factory buildings',
  og_title text not null default 'Turnkey Pre-Engineered Steel Buildings | Contour Steel',
  og_description text not null default 'Contour Steel engineers turnkey Pre-Engineered Buildings (PEB), industrial refineries, factories and high-performance steel buildings across India.',
  og_image_url text not null default '/new-project-dark-facility.jpeg',
  favicon_url text not null default '/favicon.svg',
  canonical_url text not null default 'https://steelcounter.vercel.app/',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 16. Media Library
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  secure_url text not null,
  filename text not null,
  folder text not null default 'general',
  format text not null default '',
  width integer,
  height integer,
  bytes integer,
  alt_text text not null default '',
  uploaded_by text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 17. Admin Activity Logs
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  module text not null,
  record_id text not null default '',
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Attach updated_at triggers
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'site_settings', 'navigation_items', 'hero_slides', 'about_sections',
    'achievements', 'milestones', 'services', 'why_peb_benefits', 'facilities',
    'quality_items', 'quality_standards', 'project_categories', 'projects',
    'project_gallery', 'office_locations', 'contact_enquiries', 'footer_settings',
    'seo_settings', 'media_library'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', tbl, tbl);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', tbl, tbl);
  end loop;
end $$;

-- Indexes for fast ordered reads
create index if not exists idx_navigation_order on public.navigation_items (display_order, created_at);
create index if not exists idx_hero_slides_order on public.hero_slides (display_order, created_at);
create index if not exists idx_achievements_order on public.achievements (display_order, created_at);
create index if not exists idx_milestones_order on public.milestones (display_order, created_at);
create index if not exists idx_services_order on public.services (display_order, created_at);
create index if not exists idx_why_peb_order on public.why_peb_benefits (display_order, created_at);
create index if not exists idx_facilities_order on public.facilities (display_order, created_at);
create index if not exists idx_quality_items_order on public.quality_items (display_order, created_at);
create index if not exists idx_quality_standards_order on public.quality_standards (display_order, created_at);
create index if not exists idx_projects_order on public.projects (display_order, created_at);
create index if not exists idx_project_gallery_project on public.project_gallery (project_id, display_order);
create index if not exists idx_office_locations_order on public.office_locations (display_order, created_at);
create index if not exists idx_enquiries_created on public.contact_enquiries (created_at desc);
create index if not exists idx_media_folder on public.media_library (folder, created_at desc);
create index if not exists idx_activity_created on public.admin_activity_logs (created_at desc);

-- Grant schema & table permissions to anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant insert on public.contact_enquiries to anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Enable Row Level Security (RLS) on every table
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.hero_slides enable row level security;
alter table public.about_sections enable row level security;
alter table public.achievements enable row level security;
alter table public.milestones enable row level security;
alter table public.services enable row level security;
alter table public.why_peb_benefits enable row level security;
alter table public.facilities enable row level security;
alter table public.quality_items enable row level security;
alter table public.quality_standards enable row level security;
alter table public.project_categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_gallery enable row level security;
alter table public.office_locations enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.footer_settings enable row level security;
alter table public.seo_settings enable row level security;
alter table public.media_library enable row level security;
alter table public.admin_activity_logs enable row level security;

-- Public read policies for published website content
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'navigation_items', 'hero_slides', 'about_sections', 'achievements',
    'milestones', 'services', 'why_peb_benefits', 'facilities',
    'quality_items', 'quality_standards', 'project_categories', 'projects',
    'office_locations', 'footer_settings'
  ] loop
    execute format('drop policy if exists "Public read published %I" on public.%I', tbl, tbl);
    execute format('create policy "Public read published %I" on public.%I for select to anon, authenticated using (is_published = true)', tbl, tbl);
  end loop;
end $$;

-- Public read for singleton/non-boolean tables
drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "Public read seo_settings" on public.seo_settings;
create policy "Public read seo_settings" on public.seo_settings for select to anon, authenticated using (true);

drop policy if exists "Public read project_gallery" on public.project_gallery;
create policy "Public read project_gallery" on public.project_gallery for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.is_published = true)
);

-- Public enquiry submission (INSERT only)
drop policy if exists "Public insert contact_enquiries" on public.contact_enquiries;
create policy "Public insert contact_enquiries" on public.contact_enquiries for insert to anon, authenticated with check (true);

-- Authenticated admin full access across all CMS tables
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'site_settings', 'navigation_items', 'hero_slides', 'about_sections',
    'achievements', 'milestones', 'services', 'why_peb_benefits', 'facilities',
    'quality_items', 'quality_standards', 'project_categories', 'projects',
    'project_gallery', 'office_locations', 'contact_enquiries', 'footer_settings',
    'seo_settings', 'media_library', 'admin_activity_logs'
  ] loop
    execute format('drop policy if exists "Admin full access %I" on public.%I', tbl, tbl);
    execute format('create policy "Admin full access %I" on public.%I for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null)', tbl, tbl);
  end loop;
end $$;
