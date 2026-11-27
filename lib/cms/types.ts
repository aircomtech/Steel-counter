export interface HeroStat {
  figure: string;
  label: string;
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  achievements: boolean;
  services: boolean;
  why_peb: boolean;
  facilities: boolean;
  quality: boolean;
  projects: boolean;
  locations: boolean;
  contact: boolean;
}

export interface SiteSettings {
  id: string;
  key: string;
  company_name: string;
  logo_url: string;
  enquiry_email: string;
  hero_slide_duration_ms: number;
  hero_stats_kicker: string;
  hero_stats_heading: string;
  hero_stats: HeroStat[];
  achievements_kicker: string;
  achievements_label: string;
  achievements_heading: string;
  achievements_subheading: string;
  achievements_description: string;
  services_kicker: string;
  services_label: string;
  services_heading: string;
  why_peb_kicker: string;
  why_peb_label: string;
  why_peb_heading: string;
  why_peb_description: string;
  why_peb_applications: string[];
  facilities_kicker: string;
  facilities_label: string;
  facilities_heading: string;
  facilities_description: string;
  quality_kicker: string;
  quality_label: string;
  quality_heading: string;
  quality_description: string;
  quality_references_heading: string;
  projects_kicker: string;
  projects_label: string;
  projects_heading: string;
  projects_description: string;
  locations_kicker: string;
  locations_label: string;
  locations_heading: string;
  locations_description: string;
  contact_heading: string;
  contact_description: string;
  section_visibility: SectionVisibility;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  is_cta: boolean;
  display_order: number;
  is_published: boolean;
}

export interface HeroSlide {
  id: string;
  tag: string;
  kicker: string;
  title: string;
  copy: string;
  desktop_image_url: string;
  mobile_image_url: string | null;
  video_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutSection {
  id: string;
  key: string;
  section_number: string;
  section_heading: string;
  main_title: string;
  description: string;
  additional_paragraphs: string[];
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  is_published: boolean;
}

export interface Achievement {
  id: string;
  icon: string;
  figure: string;
  unit: string;
  description: string;
  is_featured: boolean;
  display_order: number;
  is_published: boolean;
}

export interface Milestone {
  id: string;
  year_label: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface ServiceItem {
  id: string;
  item_number: string;
  title: string;
  description: string;
  icon: string;
  image_url: string | null;
  cta_url: string;
  display_order: number;
  is_published: boolean;
}

export interface WhyPebBenefit {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface FacilityItem {
  id: string;
  item_number: string;
  kind: "hero" | "machine" | "secondary";
  title: string;
  subtitle: string;
  description: string;
  area_label: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface QualityItem {
  id: string;
  item_number: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface QualityStandard {
  id: string;
  name: string;
  code: string;
  description: string;
  display_order: number;
  is_published: boolean;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_published: boolean;
}

export interface ProjectGalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  category_name: string;
  status_label: string;
  description: string;
  cover_image_url: string;
  location: string;
  area_sqft: string;
  is_featured: boolean;
  display_order: number;
  is_published: boolean;
  gallery?: ProjectGalleryImage[];
}

export interface OfficeLocation {
  id: string;
  office_type: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  map_embed_url: string;
  directions_url: string;
  image_url: string | null;
  show_in_contact: boolean;
  display_order: number;
  is_published: boolean;
}

export interface ContactEnquiry {
  id: string;
  customer_name: string;
  company_name: string;
  phone: string;
  email: string;
  project_location: string;
  project_requirements: string;
  status: "New" | "Contacted" | "In Progress" | "Completed";
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSettings {
  id: string;
  key: string;
  logo_url: string;
  summary_text: string;
  company_description: string;
  contact_phone: string;
  contact_email: string;
  office_summary: string;
  copyright_text: string;
  nav_links: FooterLink[];
  social_links: FooterLink[];
  is_published: boolean;
}

export interface SeoSettings {
  id: string;
  key: string;
  site_title: string;
  meta_description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  favicon_url: string;
  canonical_url: string;
}

export interface MediaLibraryItem {
  id: string;
  public_id: string;
  secure_url: string;
  filename: string;
  folder: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt_text: string;
  uploaded_by: string;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  actor_email: string;
  action: string;
  module: string;
  record_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PublishedSiteData {
  settings: SiteSettings;
  navigation: NavigationItem[];
  heroSlides: HeroSlide[];
  about: AboutSection;
  achievements: Achievement[];
  milestones: Milestone[];
  services: ServiceItem[];
  whyPebBenefits: WhyPebBenefit[];
  facilities: FacilityItem[];
  qualityItems: QualityItem[];
  qualityStandards: QualityStandard[];
  projectCategories: ProjectCategory[];
  projects: ProjectItem[];
  offices: OfficeLocation[];
  footer: FooterSettings;
  seo: SeoSettings;
}
