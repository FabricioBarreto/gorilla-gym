// ============================================================
// ARCHIVO: app/admin/exercises/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ExercisesLibrary } from "@/components/admin/ExercisesLibrary";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminExercisesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      imageUrl: true,
    },
  });

  const muscleGroups = [...new Set(exercises.map((e) => e.muscleGroup))].sort();

  const exercisesForComponent = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscle_group: e.muscleGroup,
    image_url: e.imageUrl ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Biblioteca de Ejercicios
            </h1>
            <p className="text-gray-400">
              {exercises.length} ejercicios en {muscleGroups.length} grupos
              musculares
            </p>
          </div>
          <Link
            href="/admin/exercises/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Nuevo Ejercicio</span>
          </Link>
        </div>

        <ExercisesLibrary
          exercises={exercisesForComponent}
          muscleGroups={muscleGroups}
        />
      </main>
    </div>
  );
}
