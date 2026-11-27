import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Backend unavailable." }, { status: 503 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const id = String(body.id || "").trim();
    const url = String(body.secure_url || "").trim();

    if (!id || !url) {
      return NextResponse.json(
        { error: "Media record ID and URL are required." },
        { status: 400 },
      );
    }

    // Check if the URL is referenced anywhere on the website before deleting
    const referenceChecks = await Promise.all([
      supabase
        .from("hero_slides")
        .select("id", { count: "exact", head: true })
        .or(`desktop_image_url.eq.${url},mobile_image_url.eq.${url}`),
      supabase
        .from("about_sections")
        .select("id", { count: "exact", head: true })
        .eq("image_url", url),
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("image_url", url),
      supabase
        .from("facilities")
        .select("id", { count: "exact", head: true })
        .eq("image_url", url),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("cover_image_url", url),
      supabase
        .from("project_gallery")
        .select("id", { count: "exact", head: true })
        .eq("image_url", url),
      supabase
        .from("office_locations")
        .select("id", { count: "exact", head: true })
        .eq("image_url", url),
      supabase
        .from("site_settings")
        .select("id", { count: "exact", head: true })
        .eq("logo_url", url),
      supabase
        .from("footer_settings")
        .select("id", { count: "exact", head: true })
        .eq("logo_url", url),
      supabase
        .from("seo_settings")
        .select("id", { count: "exact", head: true })
        .or(`og_image_url.eq.${url},favicon_url.eq.${url}`),
    ]);

    const totalReferences = referenceChecks.reduce(
      (sum, res) => sum + (res.count ?? 0),
      0,
    );

    if (totalReferences > 0) {
      return NextResponse.json(
        {
          error: `This image is currently used in ${totalReferences} website section(s) or project(s). Replace or remove it there before deleting.`,
        },
        { status: 409 },
      );
    }

    const { error: deleteError } = await supabase
      .from("media_library")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete media item." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to process media deletion." },
      { status: 500 },
    );
  }
}
