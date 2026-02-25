import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { EditRoutineFormByDays } from "@/components/admin/EditRoutineFormByDays";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const [routine, allExercises] = await Promise.all([
    prisma.routine.findUnique({
      where: { id },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { orderIndex: "asc" },
              include: {
                exercise: {
                  select: { id: true, name: true, muscleGroup: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.exercise.findMany({
      select: { id: true, name: true, muscleGroup: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!routine) redirect("/admin/routines");

  const routineForComponent = {
    id: routine.id,
    name: routine.name,
    description: routine.description ?? undefined,
    category: routine.category ?? "",
    routine_days: routine.days.map((day) => ({
      id: day.id,
      day_number: day.dayNumber,
      day_name: day.dayName,
      description: day.description ?? "",
      exercises: day.exercises.map((re) => ({
        id: re.id,
        exercise_id: re.exerciseId,
        sets: re.sets,
        reps: re.reps,
        rest_seconds: re.restSeconds,
        order_index: re.orderIndex,
        exercise: {
          id: re.exercise.id,
          name: re.exercise.name,
          muscle_group: re.exercise.muscleGroup,
        },
      })),
    })),
  };

  const exercisesForComponent = allExercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscle_group: e.muscleGroup,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">✏️ Editar Rutina</h1>
          <p className="text-gray-400 mt-2">
            Modifica los detalles y ejercicios de la rutina
          </p>
        </div>
        <EditRoutineFormByDays
          routine={routineForComponent}
          allExercises={exercisesForComponent}
        />
      </main>
    </div>
  );
}
