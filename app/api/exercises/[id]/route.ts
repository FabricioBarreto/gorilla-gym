// ============================================================
// ARCHIVO: app/api/exercises/[id]/route.ts
// PUT - Actualizar ejercicio
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const { name, muscle_group, description, instructions } = await req.json();

    await prisma.exercise.update({
      where: { id },
      data: {
        name: name?.trim(),
        muscleGroup: muscle_group?.trim(),
        description: description?.trim() || null,
        instructions: instructions?.trim() || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
