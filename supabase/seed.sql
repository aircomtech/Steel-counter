-- Contour Steel CMS - Idempotent Initial Seed Data
-- Run after 001_initial_schema.sql in Supabase SQL Editor.

-- 1. Site Settings
insert into public.site_settings (key)
values ('default')
on conflict (key) do nothing;

-- 2. SEO Settings
insert into public.seo_settings (key)
values ('default')
on conflict (key) do nothing;

-- 3. Footer Settings
insert into public.footer_settings (key)
values ('default')
on conflict (key) do nothing;

-- 4. About Section
insert into public.about_sections (
  key, section_number, section_heading, main_title, description, additional_paragraphs, cta_text, cta_url, is_published
)
values (
  'main',
  '01',
  'About Us',
  'Engineering certainty into every square foot.',
  'Contour Steel Engineering India delivers turnkey steel building solutions with international quality standards and commercial discipline.',
  '["Our technical teams support clients from the first enquiry through design, fabrication, delivery and project completion—helping them save time, avoid complexity and build with confidence."]'::jsonb,
  'Discover our capabilities',
  '#capabilities',
  true
)
on conflict (key) do nothing;

-- 5. Navigation Items (seed only if empty)
insert into public.navigation_items (label, url, is_cta, display_order, is_published)
select v.label, v.url, v.is_cta, v.display_order, true
from (values
  ('About Us', '#about', false, 1),
  ('Why PEB', '#why-peb', false, 2),
  ('Facilities', '#facilities', false, 3),
  ('Quality System', '#quality', false, 4),
  ('Projects', '#projects', false, 5),
  ('Contact Our Team', '#contact', false, 6),
  ('Request a Quote', '#contact', true, 7)
) as v(label, url, is_cta, display_order)
where not exists (select 1 from public.navigation_items);

-- 6. Hero Slides (seed only if empty)
insert into public.hero_slides (
  tag, kicker, title, copy, desktop_image_url, mobile_image_url, video_url,
  primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, display_order, is_published
)
select v.tag, v.kicker, v.title, v.copy, v.desktop_image_url, v.mobile_image_url, v.video_url,
       v.primary_cta_label, v.primary_cta_url, 'Request a Quote', '#contact', v.display_order, true
from (values
  ('About Us', '19 years of steel-building expertise', 'Engineering certainty. From concept to completion.', 'Turnkey pre-engineered building solutions designed, manufactured and delivered around your commercial goals.', '/new-project-dark-facility.jpeg', '/new-project-dark-facility.jpeg', 'https://www.contoursteel.co.in/video/home.mp4', 'Discover Contour', '#about', 1),
  ('Why PEB', '30 million sq. ft. delivered', 'Build faster. Expand easier. Perform longer.', 'Economical structural systems, long clear spans, factory-controlled quality and faster on-site assembly.', '/boiler-house.jpg', '/boiler-house.jpg', null, 'Why PEB', '#why-peb', 2),
  ('Facilities', 'Total factory area · 20,234 sq. m.', 'Modern manufacturing. Controlled at every stage.', 'Five acres equipped for CNC cutting, H-beam assembly, automated SAW welding, roll forming and secondary fabrication.', '/facilities.jpg', '/facilities.jpg', null, 'Explore Facilities', '#facilities', 3),
  ('Quality', 'International standards', 'Predictable quality at every stage.', 'Structured assurance, control, inspection and planning—from incoming raw material to final dispatch.', '/multitorch.jpg', '/multitorch.jpg', null, 'Our Quality System', '#quality', 4),
  ('Projects', '1,100+ completed projects', 'Built across industries. Proven in the field.', 'Factories, warehouses, mills, commercial facilities and specialist steel structures delivered across India.', '/new-project-green-facility.jpeg', '/new-project-green-facility.jpeg', null, 'View Projects', '#projects', 5),
  ('Contact', 'Let’s build your next project', 'Start with a conversation. Finish with certainty.', 'Share your project location, intended use and approximate area with our Hyderabad or Pune teams.', '/logistics-ware-house.jpg', '/logistics-ware-house.jpg', null, 'Contact Our Team', '#contact', 6)
) as v(tag, kicker, title, copy, desktop_image_url, mobile_image_url, video_url, primary_cta_label, primary_cta_url, display_order)
where not exists (select 1 from public.hero_slides);

-- 7. Achievements (seed only if empty)
insert into public.achievements (icon, figure, unit, description, is_featured, display_order, is_published)
select v.icon, v.figure, v.unit, v.description, v.is_featured, v.display_order, true
from (values
  ('XIX', '19', 'Years', 'Of uncompromising quality in steel buildings.', true, 1),
  ('▦', '1,100+', 'Structures', 'Successfully delivered pan-India.', true, 2),
  ('□', '30 Million', 'Sq. Ft.', 'Of total engineered PEB space.', true, 3),
  ('↔', '45-Meter', 'Clear Span', 'Maximum span designed to withstand 180 kmph winds.', false, 4),
  ('↕', '25-Meter', 'Height', 'Maximum clear building height achieved.', false, 5),
  ('▤', '11-Floor', 'Refinery', 'Complex vertical engineering for edible-oil plants.', false, 6),
  ('▰', '200,000', 'Sq. Ft.', 'Our single largest footprint factory building.', false, 7),
  ('P', '3,000', 'Vehicles', 'Massive five-level multi-level car park infrastructure.', false, 8),
  ('⌁', '70 + 30 MT', 'Load', 'Maximum EOT crane capacity on a 24-meter clear span.', false, 9)
) as v(icon, figure, unit, description, is_featured, display_order)
where not exists (select 1 from public.achievements);

-- 8. Milestones (seed only if empty)
insert into public.milestones (year_label, title, subtitle, description, display_order, is_published)
select v.year_label, v.title, v.subtitle, v.description, v.display_order, true
from (values
  ('2007', 'Foundation & Engineering Roots', 'Hyderabad', 'Established Contour Steel Engineering with a focus on precision pre-engineered steel structures.', 1),
  ('2015', '5-Acre Manufacturing Expansion', 'Seriguda Plant', 'Commissioned our 20,234 sq. m. automated H-beam, CNC cutting and SAW welding facility.', 2),
  ('2026', '1,100+ Structures & 30M Sq. Ft.', 'Pan-India Delivery', 'Delivered complex multi-storey refineries, logistics townships, factories and commercial landmarks.', 3)
) as v(year_label, title, subtitle, description, display_order)
where not exists (select 1 from public.milestones);

-- 9. Services (seed only if empty)
insert into public.services (item_number, title, description, icon, cta_url, display_order, is_published)
select v.item_number, v.title, v.description, v.icon, '#contact', v.display_order, true
from (values
  ('01', 'Pre-Engineered Buildings', 'Optimized primary and secondary framing engineered for speed, economy and dependable performance.', '↗', 1),
  ('02', 'Turnkey Project Delivery', 'One accountable partner—from concept to design, engineering and detailing through fabrication, dispatch and erection.', '↗', 2),
  ('03', 'Steel Structures', 'Factories, warehouses, workshops, showrooms, convention centres, commercial buildings, logistics facilities and custom long-span applications.', '↗', 3),
  ('04', 'Accessories & Systems', 'Mezzanines, crane beams, roofing, cladding, ventilation and integrated building accessories.', '↗', 4)
) as v(item_number, title, description, icon, display_order)
where not exists (select 1 from public.services);

-- 10. Why PEB Benefits (seed only if empty)
insert into public.why_peb_benefits (title, description, display_order, is_published)
select v.title, v.description, v.display_order, true
from (values
  ('Faster project delivery', 'Factory-fabricated components arrive ready for rapid bolted erection on site.', 1),
  ('Economical structural systems', 'Tapered built-up sections optimize steel weight without compromising strength.', 2),
  ('Long clear spans', 'Column-free interiors up to 45 meters and beyond for unobstructed operations.', 3),
  ('Lower foundation demand', 'Lighter structural dead loads reduce civil foundation complexity and cost.', 4),
  ('Easy expansion and relocation', 'Modular end-walls and bolted frames simplify future bay extensions.', 5),
  ('High seismic performance', 'Ductile steel framing engineered to international wind and seismic codes.', 6)
) as v(title, description, display_order)
where not exists (select 1 from public.why_peb_benefits);

-- 11. Facilities (seed only if empty)
insert into public.facilities (item_number, kind, title, subtitle, description, area_label, image_url, display_order, is_published)
select v.item_number, v.kind, v.title, v.subtitle, v.description, v.area_label, v.image_url, v.display_order, true
from (values
  ('00', 'hero', 'Integrated production facility', '5 Acres', 'Complete primary and secondary fabrication capability under one controlled manufacturing system.', '20,234 sq. m.', '/facilities.jpg', 1),
  ('01', 'machine', 'Multi Torch CNC Cutting', 'Primary Line', 'High-efficiency, high-precision oxy-fuel cutting combining numerical control with precision machinery transmission.', '', '/multitorch.jpg', 2),
  ('02', 'machine', 'H-Beam Automatic Assembly', 'Primary Line', 'Automated assembly and spot welding for symmetrical, asymmetrical, eccentric and variable cross-section H-type steel.', '', '/hbeam.jpg', 3),
  ('03', 'machine', 'Automated SAW Welding', 'Primary Line', 'Two fully automated submerged-arc welding machines deliver consistent weld quality with automatic flux recovery.', '', '/automaticsaw.jpg', 4),
  ('04', 'secondary', 'Secondary fabrication & roll forming', 'Roll Forming & Accessories', 'MIG welding, arc welding, shearing, bending, iron working, drilling and punching support secondary fabrication. The cold-roll forming section produces three profiles, including Z and C purlins with online round/slot punching and pre-cut capability. Roofing accessories—crimping, curving, flashings and four-metre gutters—are produced using hydraulic press brakes and dedicated forming machines.', '', null, 5)
) as v(item_number, kind, title, subtitle, description, area_label, image_url, display_order)
where not exists (select 1 from public.facilities);

-- 12. Quality Items & Standards (seed only if empty)
insert into public.quality_items (item_number, title, description, display_order, is_published)
select v.item_number, v.title, v.description, v.display_order, true
from (values
  ('01', 'Quality Assurance', 'A proactive system that improves workflow effectiveness and consistently meets client expectations.', 1),
  ('02', 'Quality Control', 'Inspection begins with raw-material compliance and continues throughout fabrication and roll forming, with records retained for reference.', 2),
  ('03', 'Quality Planning', 'Process adherence, improvement plans and good practices maintain high standards across every project.', 3)
) as v(item_number, title, description, display_order)
where not exists (select 1 from public.quality_items);

insert into public.quality_standards (name, code, display_order, is_published)
select v.name, v.code, v.display_order, true
from (values
  ('IS Building Codes', 'IS', 1),
  ('AISC Steel Construction Manual', 'AISC', 2),
  ('AISI Cold-Formed Steel Specification', 'AISI', 3),
  ('MBMA Recommended Design Practices', 'MBMA', 4),
  ('ASTM', 'ASTM', 5),
  ('American Welding Society (AWS)', 'AWS', 6),
  ('IS 875 — Wind Loads', 'IS 875', 7),
  ('Uniform Building Code (UBC)', 'UBC', 8)
) as v(name, code, display_order)
where not exists (select 1 from public.quality_standards);

-- 13. Project Categories
insert into public.project_categories (name, slug, display_order, is_published)
values
  ('Industrial', 'industrial', 1, true),
  ('Logistics', 'logistics', 2, true),
  ('Commercial', 'commercial', 3, true),
  ('Structural Steel', 'structural-steel', 4, true),
  ('Heavy Industrial', 'heavy-industrial', 5, true),
  ('Temperature Controlled', 'temperature-controlled', 6, true),
  ('Agri Industrial', 'agri-industrial', 7, true),
  ('Work in Progress', 'work-in-progress', 8, true),
  ('Completed Project', 'completed-project', 9, true),
  ('Aerial View', 'aerial-view', 10, true)
on conflict (slug) do nothing;

-- 14. Projects (seed only if empty)
insert into public.projects (title, slug, category_id, category_name, status_label, cover_image_url, is_featured, display_order, is_published)
select
  v.title,
  v.slug,
  (select id from public.project_categories c where c.name = v.category_name limit 1),
  v.category_name,
  v.status_label,
  v.cover_image_url,
  v.is_featured,
  v.display_order,
  true
from (values
  ('Industrial Manufacturing Complex', 'industrial-manufacturing-complex', 'Aerial View', 'Completed Project', '/project-industrial-complex-aerial.jpeg', true, 1),
  ('Process Plant Structure', 'process-plant-structure', 'Industrial', 'Completed Project', '/project-process-plant.jpeg', true, 2),
  ('Multi-Storey Industrial Facility', 'multi-storey-industrial-facility', 'Industrial', 'Completed Project', '/project-multistorey-facility.jpeg', true, 3),
  ('Pre-Engineered Warehouse', 'pre-engineered-warehouse', 'Completed Project', 'Completed Project', '/project-preengineered-warehouse.jpeg', false, 4),
  ('Modern Industrial Facility', 'modern-industrial-facility', 'Completed Project', 'Completed Project', '/new-project-dark-facility.jpeg', true, 5),
  ('Manufacturing Facility', 'manufacturing-facility', 'Completed Project', 'Completed Project', '/new-project-green-facility.jpeg', false, 6),
  ('Pre-Engineered Factory', 'pre-engineered-factory', 'Completed Project', 'Completed Project', '/new-project-blue-facility.jpeg', false, 7),
  ('Industrial Facility', 'industrial-facility', 'Industrial', 'Completed Project', '/new-project-herbochem.png', false, 8),
  ('Industrial Steel Frame', 'industrial-steel-frame', 'Work in Progress', 'Work in Progress', '/new-project-steel-frame.jpeg', false, 9),
  ('Multi-Level Steel Structure', 'multi-level-steel-structure', 'Work in Progress', 'Work in Progress', '/new-project-multilevel-frame.jpeg', false, 10),
  ('Roofing & Structural Progress', 'roofing-structural-progress', 'Work in Progress', 'Work in Progress', '/new-project-roofing-progress.jpeg', false, 11),
  ('Roof Framing Installation', 'roof-framing-installation', 'Work in Progress', 'Work in Progress', '/steel-erection-aerial-02.jpeg', false, 12),
  ('Multi-Storey Steel Structure — Erection', 'multi-storey-steel-structure-erection', 'Work in Progress', 'Work in Progress', '/steel-structure-erection.jpeg', false, 13),
  ('HMDA Truck Dock Logistics Township', 'hmda-truck-dock-logistics-township', 'Logistics', 'Completed Project', '/hmda-truck-dock-logistics-township.jpeg', true, 14),
  ('Warehouse Cluster', 'warehouse-cluster', 'Logistics', 'Completed Project', '/warehouse-cluster.jpeg', false, 15),
  ('Warehouse Interior & Racking', 'warehouse-interior-racking', 'Completed Project', 'Completed Project', '/warehouse-interior-racking.jpeg', false, 16),
  ('Netra Furniture Mall', 'netra-furniture-mall', 'Commercial', 'Completed Project', '/netra-furniture-mall.jpeg', true, 17),
  ('Multi-Level Steel Frame', 'multi-level-steel-frame', 'Structural Steel', 'Completed Project', '/multi-level-steel-frame-01.jpeg', false, 18),
  ('Decking Installation', 'decking-installation', 'Work in Progress', 'Work in Progress', '/decking-installation.jpeg', false, 19),
  ('Project Progress — Aerial View', 'project-progress-aerial-view', 'Work in Progress', 'Work in Progress', '/project-progress-aerial.jpeg', false, 20),
  ('Boiler House', 'boiler-house', 'Industrial', 'Completed Project', '/boiler-house.jpg', false, 21),
  ('Car Showroom', 'car-showroom', 'Commercial', 'Completed Project', '/car-showroom.jpg', false, 22),
  ('Cold Storage', 'cold-storage', 'Temperature Controlled', 'Completed Project', '/cold-storage.jpg', false, 23),
  ('Feed Mill', 'feed-mill', 'Agri Industrial', 'Completed Project', '/feed-mill.jpg', false, 24),
  ('Logistics Warehouse', 'logistics-warehouse', 'Logistics', 'Completed Project', '/logistics-ware-house.jpg', false, 25),
  ('Refinery Structure', 'refinery-structure', 'Heavy Industrial', 'Completed Project', '/refinery.jpg', false, 26),
  ('Steel Rolling Mill', 'steel-rolling-mill', 'Heavy Industrial', 'Completed Project', '/steel-rolling-mill.jpg', false, 27)
) as v(title, slug, category_name, status_label, cover_image_url, is_featured, display_order)
where not exists (select 1 from public.projects);

-- 15. Office Locations (seed only if empty)
insert into public.office_locations (
  office_type, city, address, phone, email, map_embed_url, directions_url, show_in_contact, display_order, is_published
)
select v.office_type, v.city, v.address, v.phone, v.email, v.map_embed_url, v.directions_url, v.show_in_contact, v.display_order, true
from (values
  (
    'Head Office',
    'Hyderabad',
    E'H No: 9-4-77/A/249, 3rd Floor, Rauf Plaza,\nAl Hasnath Colony, Toli Chowki,\nHyderabad – 500 008, Telangana, India',
    '+91 91009 96655',
    'hydsales@contoursteel.co.in',
    'https://www.google.com/maps?q=H%20No%209-4-77%2FA%2F249%20Rauf%20Plaza%20Toli%20Chowki%20Hyderabad%20500008&output=embed',
    'https://www.google.com/maps/search/?api=1&query=H+No+9-4-77%2FA%2F249+Rauf+Plaza+Toli+Chowki+Hyderabad+500008',
    true,
    1
  ),
  (
    'Branch Office',
    'Pune',
    E'#209, 2nd Floor, Ajinkyatara Building,\nAbove Airtel Showroom, Sinhagad Road,\nPune – 411030, Maharashtra, India',
    '+91 93268 63516',
    'punesales@contoursteel.co.in',
    'https://www.google.com/maps?q=Ajinkyatara%20Building%20Sinhagad%20Road%20Pune%20411030&output=embed',
    'https://www.google.com/maps/search/?api=1&query=Ajinkyatara+Building+Sinhagad+Road+Pune+411030',
    true,
    2
  ),
  (
    'Manufacturing Plant',
    'Seriguda',
    E'Contour Steel Engineering (Plant),\nSeriguda, Telangana – 509202,\nIndia',
    '',
    'hydsales@contoursteel.co.in',
    'https://www.google.com/maps?q=Contour%20Steel%20Engineering%20Plant%20Seriguda%20Telangana%20509202&output=embed',
    'https://maps.app.goo.gl/1qhkkapxAFiX8PjZA?g_st=iw',
    false,
    3
  )
) as v(office_type, city, address, phone, email, map_embed_url, directions_url, show_in_contact, display_order)
where not exists (select 1 from public.office_locations);
