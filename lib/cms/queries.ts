import { createPublicSupabaseClient } from "../supabase/server";
import { DEFAULT_SITE_DATA } from "./defaults";
import type {
  AboutSection,
  Achievement,
  FacilityItem,
  FooterSettings,
  HeroSlide,
  Milestone,
  NavigationItem,
  OfficeLocation,
  ProjectCategory,
  ProjectGalleryImage,
  ProjectItem,
  PublishedSiteData,
  QualityItem,
  QualityStandard,
  SeoSettings,
  ServiceItem,
  SiteSettings,
  WhyPebBenefit,
} from "./types";

export async function getPublishedSiteData(): Promise<PublishedSiteData> {
  const client = createPublicSupabaseClient();
  if (!client) {
    return DEFAULT_SITE_DATA;
  }

  try {
    const [
      settingsRes,
      navRes,
      slidesRes,
      aboutRes,
      achievementsRes,
      milestonesRes,
      servicesRes,
      whyPebRes,
      facilitiesRes,
      qualityItemsRes,
      qualityStandardsRes,
      categoriesRes,
      projectsRes,
      galleryRes,
      officesRes,
      footerRes,
      seoRes,
    ] = await Promise.all([
      client.from("site_settings").select("*").eq("key", "default").maybeSingle(),
      client.from("navigation_items").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("hero_slides").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("about_sections").select("*").eq("key", "main").maybeSingle(),
      client.from("achievements").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("milestones").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("services").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("why_peb_benefits").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("facilities").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("quality_items").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("quality_standards").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("project_categories").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("projects").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("project_gallery").select("*").order("display_order", { ascending: true }),
      client.from("office_locations").select("*").eq("is_published", true).order("display_order", { ascending: true }),
      client.from("footer_settings").select("*").eq("key", "default").maybeSingle(),
      client.from("seo_settings").select("*").eq("key", "default").maybeSingle(),
    ]);

    const galleryByProject = new Map<string, ProjectGalleryImage[]>();
    if (!galleryRes.error && galleryRes.data) {
      for (const img of galleryRes.data as ProjectGalleryImage[]) {
        const list = galleryByProject.get(img.project_id) ?? [];
        list.push(img);
        galleryByProject.set(img.project_id, list);
      }
    }

    const projects: ProjectItem[] =
      !projectsRes.error && projectsRes.data
        ? (projectsRes.data as ProjectItem[]).map((p) => ({
            ...p,
            gallery: galleryByProject.get(p.id) ?? [],
          }))
        : DEFAULT_SITE_DATA.projects;

    return {
      settings:
        !settingsRes.error && settingsRes.data
          ? (settingsRes.data as SiteSettings)
          : DEFAULT_SITE_DATA.settings,
      navigation:
        !navRes.error && navRes.data
          ? (navRes.data as NavigationItem[])
          : DEFAULT_SITE_DATA.navigation,
      heroSlides:
        !slidesRes.error && slidesRes.data
          ? (slidesRes.data as HeroSlide[])
          : DEFAULT_SITE_DATA.heroSlides,
      about:
        !aboutRes.error && aboutRes.data
          ? (aboutRes.data as AboutSection)
          : DEFAULT_SITE_DATA.about,
      achievements:
        !achievementsRes.error && achievementsRes.data
          ? (achievementsRes.data as Achievement[])
          : DEFAULT_SITE_DATA.achievements,
      milestones:
        !milestonesRes.error && milestonesRes.data
          ? (milestonesRes.data as Milestone[])
          : DEFAULT_SITE_DATA.milestones,
      services:
        !servicesRes.error && servicesRes.data
          ? (servicesRes.data as ServiceItem[])
          : DEFAULT_SITE_DATA.services,
      whyPebBenefits:
        !whyPebRes.error && whyPebRes.data
          ? (whyPebRes.data as WhyPebBenefit[])
          : DEFAULT_SITE_DATA.whyPebBenefits,
      facilities:
        !facilitiesRes.error && facilitiesRes.data
          ? (facilitiesRes.data as FacilityItem[])
          : DEFAULT_SITE_DATA.facilities,
      qualityItems:
        !qualityItemsRes.error && qualityItemsRes.data
          ? (qualityItemsRes.data as QualityItem[])
          : DEFAULT_SITE_DATA.qualityItems,
      qualityStandards:
        !qualityStandardsRes.error && qualityStandardsRes.data
          ? (qualityStandardsRes.data as QualityStandard[])
          : DEFAULT_SITE_DATA.qualityStandards,
      projectCategories:
        !categoriesRes.error && categoriesRes.data
          ? (categoriesRes.data as ProjectCategory[])
          : DEFAULT_SITE_DATA.projectCategories,
      projects,
      offices:
        !officesRes.error && officesRes.data
          ? (officesRes.data as OfficeLocation[])
          : DEFAULT_SITE_DATA.offices,
      footer:
        !footerRes.error && footerRes.data
          ? (footerRes.data as FooterSettings)
          : DEFAULT_SITE_DATA.footer,
      seo:
        !seoRes.error && seoRes.data
          ? (seoRes.data as SeoSettings)
          : DEFAULT_SITE_DATA.seo,
    };
  } catch {
    return DEFAULT_SITE_DATA;
  }
}

export async function getPublishedSeoSettings(): Promise<SeoSettings> {
  const client = createPublicSupabaseClient();
  if (!client) return DEFAULT_SITE_DATA.seo;

  try {
    const { data, error } = await client
      .from("seo_settings")
      .select("*")
      .eq("key", "default")
      .maybeSingle();

    if (error || !data) return DEFAULT_SITE_DATA.seo;
    return data as SeoSettings;
  } catch {
    return DEFAULT_SITE_DATA.seo;
  }
}
