import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
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

    revalidatePath("/", "layout");
    revalidatePath("/");

    return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Revalidation failed." }, { status: 500 });
  }
}
