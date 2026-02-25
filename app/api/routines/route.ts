// ============================================================
// ARCHIVO: app/api/routines/route.ts
// POST - Crear rutina con días y ejercicios
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

    const { name, description, category, days } = await req.json();

    if (!name?.trim())
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    if (!category)
      return NextResponse.json(
        { error: "Categoría requerida" },
        { status: 400 },
      );
    if (!days || days.length === 0)
      return NextResponse.json(
        { error: "Al menos un día requerido" },
        { status: 400 },
      );

    const routine = await prisma.$transaction(async (tx) => {
      const r = await tx.routine.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          category,
          createdBy: session.id,
        },
      });

      for (const day of days) {
        const rd = await tx.routineDay.create({
          data: {
            routineId: r.id,
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

      return r;
    });

    return NextResponse.json({ success: true, id: routine.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
