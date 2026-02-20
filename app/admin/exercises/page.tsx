import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminExercisesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // Obtener grupos musculares únicos
  const { data: exercises } = await supabase
    .from("exercises")
    .select("muscle_group")
    .order("muscle_group");

  // Agrupar y contar ejercicios por grupo muscular
  const muscleGroups =
    exercises?.reduce((acc: any[], exercise) => {
      const existing = acc.find((g) => g.name === exercise.muscle_group);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: exercise.muscle_group, count: 1 });
      }
      return acc;
    }, []) || [];

  // Iconos por grupo muscular
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
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📚 Biblioteca de Ejercicios
              </h1>
              <p className="text-gray-400">
                Explora {exercises?.length || 0} ejercicios organizados por
                grupo muscular
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
        </div>

        {/* Grid de grupos musculares */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {muscleGroups.map((group) => (
            <Link
              key={group.name}
              href={`/admin/exercises/group/${encodeURIComponent(group.name)}`} // ← Cambiar aquí
              className="group aspect-square bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105"
            >
              <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                {muscleIcons[group.name] || "🏋️"}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">
                {group.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {group.count} ejercicio{group.count !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>

        {muscleGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏋️</div>
            <p className="text-gray-400 text-lg">
              No hay ejercicios disponibles
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
