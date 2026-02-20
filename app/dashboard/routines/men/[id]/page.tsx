import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";

export default async function RoutineDaysPage({
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

  if (!routine) redirect("/dashboard/routines/men");

  // Días de entrenamiento
  const days = [
    { day: 1, name: "Día 1", focus: "Pecho y Tríceps" },
    { day: 2, name: "Día 2", focus: "Espalda y Bíceps" },
    { day: 3, name: "Día 3", focus: "Piernas" },
    { day: 4, name: "Día 4", focus: "Hombros y Abdomen" },
    { day: 5, name: "Día 5", focus: "Full Body" },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/routines/men"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Volver a rutinas
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{routine.name}</h1>
          <p className="text-gray-400">Selecciona el día de entrenamiento</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {days.map((day) => (
            <Link
              key={day.day}
              href={`/dashboard/routines/men/${id}/day/${day.day}`}
              className="group aspect-square bg-gray-800 border-2 border-gray-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105"
            >
              <h3 className="text-2xl font-bold text-white mb-1">{day.name}</h3>
              <p className="text-gray-400 text-sm text-center">{day.focus}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
