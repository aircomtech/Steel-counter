import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return (
    <AdminDashboardClient
      userEmail={user.email ?? "Administrator"}
      supabaseUrl={supabaseUrl}
      supabaseAnonKey={supabaseAnonKey}
    />
  );
}
