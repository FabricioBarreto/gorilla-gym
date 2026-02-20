import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import { OfflineRoutinesLoader } from "@/components/user/OfflineRoutinesLoader";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function UserRoutinePage() {
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

  // Intentar obtener rutinas online
  let routines = null;
  try {
    const { data } = await supabase
      .from("routines")
      .select(
        `
        *,
        routine_days (
          id,
          routine_exercises (count)
        )
      `,
      )
      .order("name");

    routines = data;
  } catch (error) {
    console.log("Error fetching routines, will use offline data");
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            💪 Rutinas Disponibles
          </h1>
        </div>

        {/* Componente que maneja online/offline */}
        <OfflineRoutinesLoader initialRoutines={routines} userId={user.id} />
      </main>
    </div>
  );
}
