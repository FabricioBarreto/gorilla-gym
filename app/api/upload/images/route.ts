// ============================================================
// ARCHIVO: app/api/upload/images/route.ts
// POST - Subir imagenes a Supabase Storage
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { images, bucket = "exercise-images" } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron imagenes" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const urls: string[] = [];

    for (const base64Image of images) {
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Formato de imagen invalido");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const ext = mimeType.split("/")[1] || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw new Error(error.message);

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      urls.push(publicData.publicUrl);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
