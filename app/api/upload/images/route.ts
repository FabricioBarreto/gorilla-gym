// ============================================================
// ARCHIVO: app/api/upload/images/route.ts
// POST - Subir imágenes en base64 y retornar URLs públicas
// Reemplaza supabase.storage.from("exercise-images").upload()
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { images, bucket = "exercise-images" } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron imágenes" },
        { status: 400 },
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads", bucket);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const urls: string[] = [];

    for (const base64Image of images) {
      // base64Image puede ser "data:image/jpeg;base64,/9j/..." o solo base64
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Formato de imagen inválido");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Determinar extensión
      const ext = mimeType.split("/")[1] || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      // URL pública relativa
      const publicUrl = `/uploads/${bucket}/${filename}`;
      urls.push(publicUrl);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
