import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { NewRoutineFormByDays } from "@/components/admin/NewRoutineFormByDays";

export default async function NewRoutinePage() {
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

  // Obtener todos los ejercicios
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group")
    .order("name");

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">➕ Nueva Rutina</h1>
          <p className="text-gray-400 mt-2">
            Crea una rutina organizada por días
          </p>
        </div>

        <NewRoutineFormByDays exercises={exercises || []} adminId={user.id} />
      </main>
    </div>
  );
}
