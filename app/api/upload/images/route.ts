// ============================================================
// ARCHIVO: app/api/upload/images/route.ts
// POST - Subir imagenes a Cloudinary
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";

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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!; // unsigned preset

    const urls: string[] = [];

    for (const base64Image of images) {
      const formData = new FormData();
      formData.append("file", base64Image);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", bucket);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Error al subir imagen");
      }

      urls.push(data.secure_url);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("[upload] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
