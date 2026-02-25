import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { DayExercises } from "@/components/user/DayExercises";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function WomenDayExercisesPage({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const { id, day } = await params;
  const dayNumber = parseInt(day);

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const profile = await prisma.profile.findUnique({
    where: { id: session.id },
    select: { fullName: true },
  });

  const routine = await prisma.routine.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!routine) redirect("/dashboard/routines/women");

  const routineDay = await prisma.routineDay.findFirst({
    where: { routineId: id, dayNumber },
  });
  if (!routineDay) redirect(`/dashboard/routines/women/${id}`);

  const exercises = await prisma.routineExercise.findMany({
    where: { routineDayId: routineDay.id },
    orderBy: { orderIndex: "asc" },
    include: { exercise: { include: { images: true } } },
  });

  const exercisesForComponent = exercises.map((re) => ({
    ...re,
    notes: re.notes ?? undefined,
    routine_day_id: re.routineDayId,
    exercise_id: re.exerciseId,
    rest_seconds: re.restSeconds,
    order_index: re.orderIndex,
    created_at: re.createdAt.toISOString(),
    exercise: {
      ...re.exercise,
      description: re.exercise.description ?? undefined, // ← dentro de exercise
      instructions: re.exercise.instructions ?? undefined, // ← dentro de exercise
      muscle_group: re.exercise.muscleGroup,
      image_url: re.exercise.imageUrl,
      video_url: re.exercise.videoUrl,
      created_at: re.exercise.createdAt.toISOString(),
      updated_at: re.exercise.updatedAt.toISOString(),
      exercise_images: re.exercise.images.map((img) => ({
        ...img,
        image_url: img.imageUrl,
        exercise_id: img.exerciseId,
        order_index: img.orderIndex,
        created_at: img.createdAt.toISOString(),
      })),
    },
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/dashboard/routines/women/${id}`}
            className="inline-flex items-center text-pink-400 hover:text-pink-300 mb-4"
          >
            ← Volver a días
          </Link>
          <div className="text-pink-400 font-bold text-sm mb-1">
            DÍA {routineDay.dayNumber}
          </div>
          <h1 className="text-4xl font-bold text-white">
            {routineDay.dayName}
          </h1>
          {routineDay.description && (
            <p className="text-gray-400 mt-2">{routineDay.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-4">
            {exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""}{" "}
            programados
          </p>
        </div>
        <DayExercises exercises={exercisesForComponent} />
      </main>
    </div>
  );
}
