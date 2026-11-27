import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SITE_DATA } from "@/lib/cms/defaults";
import { slugify, triggerWebsiteRevalidation } from "@/lib/admin/cms-helpers";

/**
 * Seeds any empty CMS tables with the original Contour Steel website data.
 * Only inserts into tables that currently have 0 rows so existing edits are preserved.
 */
export async function seedMissingCmsData(
  supabase: SupabaseClient,
): Promise<{ seededTables: string[] }> {
  const seededTables: string[] = [];

  // 1. Site Settings
  const { data: existingSettings } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", "default")
    .maybeSingle();
  if (!existingSettings) {
    const { id: _id, ...rest } = DEFAULT_SITE_DATA.settings;
    void _id;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ ...rest, key: "default" }, { onConflict: "key" });
    if (!error) seededTables.push("site_settings");
  }

  // 2. SEO Settings
  const { data: existingSeo } = await supabase
    .from("seo_settings")
    .select("id")
    .eq("key", "default")
    .maybeSingle();
  if (!existingSeo) {
    const { id: _id, ...rest } = DEFAULT_SITE_DATA.seo;
    void _id;
    const { error } = await supabase
      .from("seo_settings")
      .upsert({ ...rest, key: "default" }, { onConflict: "key" });
    if (!error) seededTables.push("seo_settings");
  }

  // 3. Footer Settings
  const { data: existingFooter } = await supabase
    .from("footer_settings")
    .select("id")
    .eq("key", "default")
    .maybeSingle();
  if (!existingFooter) {
    const { id: _id, ...rest } = DEFAULT_SITE_DATA.footer;
    void _id;
    const { error } = await supabase
      .from("footer_settings")
      .upsert({ ...rest, key: "default" }, { onConflict: "key" });
    if (!error) seededTables.push("footer_settings");
  }

  // 4. About Section
  const { data: existingAbout } = await supabase
    .from("about_sections")
    .select("id")
    .eq("key", "main")
    .maybeSingle();
  if (!existingAbout) {
    const { id: _id, ...rest } = DEFAULT_SITE_DATA.about;
    void _id;
    const { error } = await supabase
      .from("about_sections")
      .upsert({ ...rest, key: "main" }, { onConflict: "key" });
    if (!error) seededTables.push("about_sections");
  }

  // Helper for array tables
  async function seedIfEmpty<T extends { id?: string }>(
    table: string,
    rows: T[],
  ) {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) === 0 && rows.length > 0) {
      const payload = rows.map(({ id: _id, ...rest }) => {
        void _id;
        return rest as Record<string, unknown>;
      });
      const { error } = await supabase.from(table).insert(payload);
      if (!error) seededTables.push(table);
    }
  }

  await seedIfEmpty("navigation_items", DEFAULT_SITE_DATA.navigation);
  await seedIfEmpty("hero_slides", DEFAULT_SITE_DATA.heroSlides);
  await seedIfEmpty("achievements", DEFAULT_SITE_DATA.achievements);
  await seedIfEmpty("milestones", DEFAULT_SITE_DATA.milestones);
  await seedIfEmpty("services", DEFAULT_SITE_DATA.services);
  await seedIfEmpty("why_peb_benefits", DEFAULT_SITE_DATA.whyPebBenefits);
  await seedIfEmpty("facilities", DEFAULT_SITE_DATA.facilities);
  await seedIfEmpty("quality_items", DEFAULT_SITE_DATA.qualityItems);
  await seedIfEmpty("quality_standards", DEFAULT_SITE_DATA.qualityStandards);
  await seedIfEmpty("project_categories", DEFAULT_SITE_DATA.projectCategories);
  await seedIfEmpty("office_locations", DEFAULT_SITE_DATA.offices);

  // Projects (link category_id where matching)
  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });
  if ((projectCount ?? 0) === 0) {
    const { data: cats } = await supabase
      .from("project_categories")
      .select("id, name");
    const catMap = new Map<string, string>(
      (cats || []).map((c: { id: string; name: string }) => [c.name, c.id]),
    );
    const projectPayload = DEFAULT_SITE_DATA.projects.map(
      ({ id: _id, gallery: _gal, ...rest }) => {
        void _id;
        void _gal;
        return {
          ...rest,
          slug: rest.slug || slugify(rest.title),
          category_id: catMap.get(rest.category_name) ?? null,
        };
      },
    );
    const { error } = await supabase.from("projects").insert(projectPayload);
    if (!error) seededTables.push("projects");
  }

  if (seededTables.length > 0) {
    await triggerWebsiteRevalidation();
  }

  return { seededTables };
}
