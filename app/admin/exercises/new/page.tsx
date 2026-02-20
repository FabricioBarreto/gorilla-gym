import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { NewExerciseForm } from "@/components/admin/NewExerciseForm";
import Link from "next/link";

export default async function NewExercisePage() {
  const supabase = await createAdminSupabaseClient();

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

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/exercises"
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a ejercicios
          </Link>

          <h1 className="text-3xl font-bold text-white mt-4">
            Nuevo Ejercicio
          </h1>
          <p className="text-gray-400 mt-2">
            Agrega un nuevo ejercicio a la biblioteca
          </p>
        </div>

        <NewExerciseForm />
      </main>
    </div>
  );
}
