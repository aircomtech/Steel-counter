import { createBrowserClient } from "@supabase/ssr";

export function createClient(overrideUrl?: string, overrideAnonKey?: string) {
  const url = overrideUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    overrideAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    throw new Error(
      "Backend environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your project settings and redeploy.",
    );
  }

  return createBrowserClient(url, anonKey);
}
