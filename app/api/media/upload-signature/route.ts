import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { MEDIA_FOLDERS } from "@/lib/cloudinary";
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

    const body = await request.json().catch(() => ({}));
    const requestedFolder = String(body.folder || "general");
    const folder = (MEDIA_FOLDERS as readonly string[]).includes(requestedFolder)
      ? requestedFolder
      : "general";

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "";
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    if (!cloudName || (!uploadPreset && (!apiKey || !apiSecret))) {
      return NextResponse.json(
        { error: "Media upload configuration is incomplete." },
        { status: 500 },
      );
    }

    if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const folderPath = `contour-steel/${folder}`;
      const paramsToSign = `folder=${folderPath}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign)
        .digest("hex");

      return NextResponse.json({
        cloudName,
        uploadPreset,
        folder,
        signed: true,
        timestamp,
        signature,
        apiKey,
      });
    }

    return NextResponse.json({
      cloudName,
      uploadPreset,
      folder,
      signed: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to prepare upload configuration." },
      { status: 500 },
    );
  }
}
