import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { DayExercises } from "@/components/user/DayExercises";
import Link from "next/link";

export default async function WomenDayExercisesPage({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const { id, day } = await params;
  const dayNumber = parseInt(day);

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

  // Obtener rutina
  const { data: routine } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (!routine) redirect("/dashboard/routines/women");

  // Obtener el día específico
  const { data: routineDay } = await supabase
    .from("routine_days")
    .select("*")
    .eq("routine_id", id)
    .eq("day_number", dayNumber)
    .single();

  if (!routineDay) redirect(`/dashboard/routines/women/${id}`);

  // Obtener ejercicios del día
  const { data: exercises } = await supabase
    .from("routine_exercises")
    .select(
      `
      *,
      exercise:exercises (
        *,
        exercise_images (*)
      )
    `,
    )
    .eq("routine_day_id", routineDay.id)
    .order("order_index");

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/dashboard/routines/women/${id}`}
            className="inline-flex items-center text-pink-400 hover:text-pink-300 mb-4"
          >
            ← Volver a días
          </Link>

          <div className="flex items-center space-x-3 mb-2">
            <div>
              <div className="text-pink-400 font-bold text-sm mb-1">
                DÍA {routineDay.day_number}
              </div>
              <h1 className="text-4xl font-bold text-white">
                {routineDay.day_name}
              </h1>
            </div>
          </div>

          {routineDay.description && (
            <p className="text-gray-400 mt-2">{routineDay.description}</p>
          )}

          <p className="text-gray-500 text-sm mt-4">
            {exercises?.length || 0} ejercicio
            {exercises?.length !== 1 ? "s" : ""} programados
          </p>
        </div>

        <DayExercises exercises={exercises || []} />
      </main>
    </div>
  );
}
