// ============================================================
// ARCHIVO: app/api/routines/[id]/route.ts
// PUT - Actualizar rutina (reemplaza días completos)
// DELETE - Eliminar rutina
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
    const { name, description, category, days } = await req.json();

    await prisma.$transaction(async (tx) => {
      // Actualizar rutina
      await tx.routine.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          category,
        },
      });

      // Eliminar todos los días (CASCADE elimina routineExercises)
      await tx.routineDay.deleteMany({ where: { routineId: id } });

      // Recrear días y ejercicios
      for (const day of days) {
        const rd = await tx.routineDay.create({
          data: {
            routineId: id,
            dayNumber: day.day_number,
            dayName: day.day_name.trim(),
            description: day.description?.trim() || null,
          },
        });

        if (day.exercises?.length > 0) {
          await tx.routineExercise.createMany({
            data: day.exercises.map((ex: any) => ({
              routineDayId: rd.id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.rest_seconds,
              notes: ex.notes || null,
              orderIndex: ex.order_index,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    // Verificar que no esté asignada
    const assignments = await prisma.routineAssignment.count({
      where: { routineId: id },
    });
    if (assignments > 0) {
      return NextResponse.json(
        {
          error:
            "Esta rutina está asignada a uno o más usuarios. Primero debes desasignarla.",
        },
        { status: 400 },
      );
    }

    // Eliminar rutina (CASCADE elimina días y ejercicios)
    await prisma.routine.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
