// ============================================================
// ARCHIVO: app/dashboard/exercises/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { UserExercisesLibrary } from "@/components/user/UserExercisesLibrary";

export default async function ExercisesLibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, exercises] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    }),
    prisma.exercise.findMany({
      orderBy: { name: "asc" },
      include: {
        images: {
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
  ]);

  const muscleGroups = [...new Set(exercises.map((e) => e.muscleGroup))].sort();

  const exercisesForComponent = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscle_group: e.muscleGroup,
    image_url: e.imageUrl ?? undefined,
    description: e.description ?? undefined,
    instructions: e.instructions ?? undefined,
    exercise_images: e.images.map((img) => ({
      id: img.id,
      image_url: img.imageUrl,
      order_index: img.orderIndex,
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            Biblioteca de Ejercicios
          </h1>
          <p className="text-gray-400">
            Explora {exercises.length} ejercicios en {muscleGroups.length}{" "}
            grupos musculares
          </p>
        </div>
        <UserExercisesLibrary
          exercises={exercisesForComponent}
          muscleGroups={muscleGroups}
        />
      </main>
    </div>
  );
}
