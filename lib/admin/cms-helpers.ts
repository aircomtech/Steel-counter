import type { SupabaseClient } from "@supabase/supabase-js";

export async function triggerWebsiteRevalidation(): Promise<void> {
  try {
    await fetch("/api/revalidate", { method: "POST" });
  } catch {
    // Non-blocking: dynamic SSR still reads live data on next request.
  }
}

export async function recordAdminActivity(
  supabase: SupabaseClient,
  params: {
    actorEmail: string;
    action: string;
    module: string;
    recordId?: string;
    summary: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from("admin_activity_logs").insert({
      actor_email: params.actorEmail,
      action: params.action,
      module: params.module,
      record_id: params.recordId || "",
      summary: params.summary,
      metadata: params.metadata || {},
    });
  } catch {
    // Do not block primary mutation if activity logging fails.
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}
