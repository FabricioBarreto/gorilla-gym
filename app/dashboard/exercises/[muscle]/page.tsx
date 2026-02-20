import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { MuscleExercisesList } from "@/components/user/MuscleExercisesList";
import Link from "next/link";

export default async function MuscleGroupExercisesPage({
  params,
}: {
  params: Promise<{ muscle: string }>;
}) {
  const { muscle } = await params;
  const muscleName = decodeURIComponent(muscle);

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  // Obtener ejercicios del grupo muscular
  const { data: exercises } = await supabase
    .from("exercises")
    .select(
      `
      *,
      exercise_images (*)
    `,
    )
    .eq("muscle_group", muscleName)
    .order("name");

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
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/exercises"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Volver a grupos musculares
          </Link>
          <div className="flex items-center space-x-4 mb-2">
            <span className="text-6xl">{muscleIcons[muscleName] || "🏋️"}</span>
            <div>
              <h1 className="text-4xl font-bold text-white">{muscleName}</h1>
              <p className="text-gray-400 mt-2">
                {exercises?.length || 0} ejercicio
                {exercises?.length !== 1 ? "s" : ""} disponibles
              </p>
            </div>
          </div>
        </div>

        <MuscleExercisesList exercises={exercises || []} />
      </main>
    </div>
  );
}
