import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";

// ⬇️ AGREGAR ESTO
export const revalidate = 0; // Deshabilitar cache
export const dynamic = "force-dynamic"; // Forzar renderizado dinámico

export default async function AdminRoutinesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener todas las rutinas con conteo de ejercicios
  const { data: routines } = await supabase
    .from("routines")
    .select(
      `
      id,
      name,
      description,
      category,
      created_at,
      routine_days (
        id,
        routine_exercises (count)
      )
    `,
    )
    .order("created_at", { ascending: false });

  // Calcular total de ejercicios por rutina
  const routinesWithCount = routines?.map((routine) => ({
    ...routine,
    exerciseCount:
      routine.routine_days?.reduce((total: number, day: any) => {
        return total + (day.routine_exercises[0]?.count || 0);
      }, 0) || 0,
  }));

  // Agrupar por categoría
  const menRoutines =
    routinesWithCount?.filter((r) => r.category === "hombres") || [];
  const womenRoutines =
    routinesWithCount?.filter((r) => r.category === "mujeres") || [];
  const uncategorized = routinesWithCount?.filter((r) => !r.category) || [];

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              📋 Gestión de Rutinas
            </h1>
            <p className="text-gray-400 mt-2">
              {routinesWithCount?.length || 0} rutinas totales
            </p>
          </div>

          <Link
            href="/admin/routines/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Nueva Rutina</span>
          </Link>
        </div>

        {/* Rutinas Hombres */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">💪</span>
            <h2 className="text-2xl font-bold text-white">Rutinas Hombres</h2>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {menRoutines.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/admin/routines/${routine.id}`}
                className="bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg p-5 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">
                    {routine.name}
                  </h3>
                  <span className="text-2xl">🏋️</span>
                </div>

                {routine.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {routine.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {routine.exerciseCount} ejercicios •{" "}
                    {routine.routine_days?.length || 0} días
                  </span>
                  <span className="text-blue-400">Ver detalles →</span>
                </div>
              </Link>
            ))}

            {menRoutines.length === 0 && (
              <div className="col-span-full text-center py-8 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-gray-400">No hay rutinas para hombres</p>
              </div>
            )}
          </div>
        </div>

        {/* Rutinas Mujeres */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">🏋️‍♀️</span>
            <h2 className="text-2xl font-bold text-white">Rutinas Mujeres</h2>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
              {womenRoutines.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {womenRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/admin/routines/${routine.id}`}
                className="bg-gray-800 border border-gray-700 hover:border-pink-500 rounded-lg p-5 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">
                    {routine.name}
                  </h3>
                  <span className="text-2xl">💪</span>
                </div>

                {routine.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {routine.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {routine.exerciseCount} ejercicios •{" "}
                    {routine.routine_days?.length || 0} días
                  </span>
                  <span className="text-pink-400">Ver detalles →</span>
                </div>
              </Link>
            ))}

            {womenRoutines.length === 0 && (
              <div className="col-span-full text-center py-8 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-gray-400">No hay rutinas para mujeres</p>
              </div>
            )}
          </div>
        </div>

        {/* Sin Categoría */}
        {uncategorized.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">❓</span>
              <h2 className="text-2xl font-bold text-white">Sin Categoría</h2>
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                {uncategorized.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uncategorized.map((routine) => (
                <Link
                  key={routine.id}
                  href={`/admin/routines/${routine.id}`}
                  className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-5 transition-all hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">
                      {routine.name}
                    </h3>
                    <span className="text-2xl">📋</span>
                  </div>

                  {routine.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {routine.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {routine.exerciseCount} ejercicios •{" "}
                      {routine.routine_days?.length || 0} días
                    </span>
                    <span className="text-gray-400">Ver detalles →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
