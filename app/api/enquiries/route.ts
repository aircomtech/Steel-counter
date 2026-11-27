import { NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body.customer_name || "").trim();
    const companyName = String(body.company_name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const projectLocation = String(body.project_location || "").trim();
    const projectRequirements = String(body.project_requirements || "").trim();

    if (!customerName || !projectRequirements || (!phone && !email)) {
      return NextResponse.json(
        {
          error:
            "Please provide your name, a phone number or email address, and your project requirements.",
        },
        { status: 400 },
      );
    }

    const supabase = createPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Enquiry service is currently unavailable." },
        { status: 503 },
      );
    }

    const { error } = await supabase.from("contact_enquiries").insert({
      customer_name: customerName,
      company_name: companyName,
      phone,
      email,
      project_location: projectLocation,
      project_requirements: projectRequirements,
      status: "New",
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to save your enquiry right now. Please try again or contact us directly.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: true, message: "Thank you. Your enquiry has been received by our team." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
