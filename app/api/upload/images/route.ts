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
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    const urls: string[] = [];

    for (const base64Image of images) {
      const formData = new FormData();
      formData.append("file", base64Image);
      formData.append("upload_preset", "ml_default");
      formData.append("folder", bucket);

      // Upload con autenticacion basica
      const timestamp = Math.round(Date.now() / 1000);
      const signatureStr = `folder=${bucket}&timestamp=${timestamp}${apiSecret}`;

      // Usar upload sin preset (autenticado)
      const authHeader =
        "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

      const formDataAuth = new FormData();
      formDataAuth.append("file", base64Image);
      formDataAuth.append("folder", bucket);
      formDataAuth.append("timestamp", timestamp.toString());
      formDataAuth.append("api_key", apiKey);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
          body: formDataAuth,
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
