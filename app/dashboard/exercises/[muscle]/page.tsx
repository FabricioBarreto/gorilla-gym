// ============================================================
// ARCHIVO: app/dashboard/exercises/[muscle]/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { MuscleExercisesList } from "@/components/user/MuscleExercisesList";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function MuscleGroupExercisesPage({
  params,
}: {
  params: Promise<{ muscle: string }>;
}) {
  const { muscle } = await params;
  const muscleName = decodeURIComponent(muscle);
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, exercises] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    }),
    prisma.exercise.findMany({
      where: { muscleGroup: muscleName },
      include: { images: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const muscleImages: Record<string, string> = {
    Bíceps: "/muscles/biceps.png",
    Cuádriceps: "/muscles/cuadriceps.png",
    Espalda: "/muscles/espalda.png",
    Glúteos: "/muscles/gluteos.png",
    Hombros: "/muscles/hombros.png",
    Isquiotibiales: "/muscles/isquiotibiales.png",
    Pecho: "/muscles/pecho.png",
    Tríceps: "/muscles/triceps.png",
  };

  const exercisesForComponent = exercises.map((e) => ({
    ...e,
    description: e.description ?? undefined,
    instructions: e.instructions ?? undefined,
    muscle_group: e.muscleGroup,
    image_url: e.imageUrl,
    video_url: e.videoUrl,
    created_at: e.createdAt.toISOString(),
    updated_at: e.updatedAt.toISOString(),
    exercise_images: e.images.map((img) => ({
      ...img,
      image_url: img.imageUrl,
      exercise_id: img.exerciseId,
      order_index: img.orderIndex,
      created_at: img.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/exercises"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Volver a grupos musculares
          </Link>
          <div className="flex items-center space-x-4 mb-2">
            {muscleImages[muscleName] && (
              <img
                src={muscleImages[muscleName]}
                alt={muscleName}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-white">{muscleName}</h1>
              <p className="text-gray-400 mt-2">
                {exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""}{" "}
                disponibles
              </p>
            </div>
          </div>
        </div>
        <MuscleExercisesList exercises={exercisesForComponent} />
      </main>
    </div>
  );
}
