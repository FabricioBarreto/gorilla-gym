import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ExerciseDetail } from "@/components/admin/ExerciseDetail";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  // Obtener el ejercicio completo con imágenes
  const { data: exercise, error } = await supabase
    .from("exercises")
    .select(
      `
      *,
      exercise_images (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !exercise) {
    notFound();
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
        </div>

        <ExerciseDetail exercise={exercise} />
      </main>
    </div>
  );
}
