import AdminLoginClient from "@/components/admin/AdminLoginClient";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return (
    <AdminLoginClient
      supabaseUrl={supabaseUrl}
      supabaseAnonKey={supabaseAnonKey}
    />
  );
}
