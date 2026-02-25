// ============================================================
// ARCHIVO: app/api/exercises/route.ts
// POST - Crear ejercicio con imágenes
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, muscle_group, description, instructions, image_urls } = body;

    if (!name?.trim())
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    if (!muscle_group?.trim())
      return NextResponse.json(
        { error: "Grupo muscular requerido" },
        { status: 400 },
      );
    if (!image_urls || image_urls.length === 0)
      return NextResponse.json(
        { error: "Se requiere al menos una imagen" },
        { status: 400 },
      );

    const exercise = await prisma.$transaction(async (tx) => {
      const ex = await tx.exercise.create({
        data: {
          name: name.trim(),
          muscleGroup: muscle_group.trim(),
          description: description?.trim() || null,
          instructions: instructions?.trim() || null,
        },
      });

      await tx.exerciseImage.createMany({
        data: image_urls.map((url: string, index: number) => ({
          exerciseId: ex.id,
          imageUrl: url,
          orderIndex: index,
        })),
      });

      return ex;
    });

    return NextResponse.json({ success: true, id: exercise.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
