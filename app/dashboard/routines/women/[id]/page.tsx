import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";

export default async function WomenRoutineDaysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Obtener días de la rutina con conteo de ejercicios
  const { data: days } = await supabase
    .from("routine_days")
    .select(
      `
      *,
      routine_exercises (count)
    `,
    )
    .eq("routine_id", id)
    .order("day_number");

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/routines/women"
            className="inline-flex items-center text-pink-400 hover:text-pink-300 mb-4"
          >
            ← Volver a rutinas
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{routine.name}</h1>
          <p className="text-gray-400">
            {days?.length || 0} día{days?.length !== 1 ? "s" : ""} de
            entrenamiento
          </p>
        </div>

        {days && days.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => (
              <Link
                key={day.id}
                href={`/dashboard/routines/women/${id}/day/${day.day_number}`}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-pink-500 rounded-xl p-6 transition-all hover:scale-105"
              >
                {/* Header del día */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-pink-400 font-bold text-sm">
                        DÍA {day.day_number}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                      {day.day_name}
                    </h3>
                  </div>
                </div>

                {/* Descripción */}
                {day.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {day.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">
                      {day.routine_exercises[0]?.count || 0} ejercicios
                    </span>
                  </div>
                  <span className="text-pink-400 group-hover:text-pink-300 text-sm">
                    Ver →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No hay días configurados para esta rutina
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
