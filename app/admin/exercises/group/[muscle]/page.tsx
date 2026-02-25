import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminMuscleGroupExercisesPage({
  params,
}: {
  params: Promise<{ muscle: string }>;
}) {
  const { muscle } = await params;
  const muscleName = decodeURIComponent(muscle);

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const exercises = await prisma.exercise.findMany({
    where: { muscleGroup: muscleName },
    include: { images: true },
    orderBy: { name: "asc" },
  });

  const muscleIcons: Record<string, string> = {
    Pecho: "💪",
    Espalda: "🏋️",
    Piernas: "🦵",
    Hombros: "🤸",
    Brazos: "💪",
    Bíceps: "💪",
    Tríceps: "💪",
    Abdomen: "🔥",
    Glúteos: "🍑",
    Pantorrillas: "🦵",
    Antebrazos: "✊",
    Cuádriceps: "🦵",
    Isquiotibiales: "🦵",
    Core: "🔥",
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/exercises"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Volver a grupos musculares
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-6xl">
                {muscleIcons[muscleName] || "🏋️"}
              </span>
              <div>
                <h1 className="text-4xl font-bold text-white">{muscleName}</h1>
                <p className="text-gray-400 mt-2">
                  {exercises.length} ejercicio
                  {exercises.length !== 1 ? "s" : ""} disponibles
                </p>
              </div>
            </div>
            <Link
              href="/admin/exercises/new"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>Nuevo Ejercicio</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.length > 0 ? (
            exercises.map((exercise) => {
              const firstImage = exercise.images?.[0];
              return (
                <Link
                  key={exercise.id}
                  href={`/admin/exercises/${exercise.id}`}
                  className="group bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl overflow-hidden transition-all hover:scale-105"
                >
                  {firstImage ? (
                    <div className="aspect-video bg-gray-700 overflow-hidden">
                      <img
                        src={firstImage.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-700 flex items-center justify-center">
                      <span className="text-6xl opacity-20">🏋️</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                      {exercise.name}
                    </h3>
                    {exercise.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {exercise.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        {exercise.muscleGroup}
                      </span>
                      <span className="text-gray-500 group-hover:text-green-400 transition-colors text-sm">
                        Ver detalles →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🏋️</div>
              <p className="text-gray-400 text-lg">
                No hay ejercicios en este grupo muscular
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
