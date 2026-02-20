import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { EditRoutineFormByDays } from "@/components/admin/EditRoutineFormByDays";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function EditRoutinePage({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // Obtener rutina completa con días y ejercicios
  const { data: routine } = await supabase
    .from("routines")
    .select(
      `
      *,
      routine_days (
        *,
        routine_exercises (
          *,
          exercise:exercises (
            id,
            name,
            muscle_group
          )
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!routine) redirect("/admin/routines");

  // Obtener todos los ejercicios disponibles
  const { data: allExercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group")
    .order("name");

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">✏️ Editar Rutina</h1>
          <p className="text-gray-400 mt-2">
            Modifica los detalles y ejercicios de la rutina
          </p>
        </div>

        <EditRoutineFormByDays
          routine={routine}
          allExercises={allExercises || []}
        />
      </main>
    </div>
  );
}
