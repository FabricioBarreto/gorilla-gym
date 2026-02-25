// ============================================================
// ARCHIVO: app/admin/routines/new/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { NewRoutineFormByDays } from "@/components/admin/NewRoutineFormByDays";
import prisma from "@/lib/prisma";

export default async function NewRoutinePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroup: true },
    orderBy: { name: "asc" },
  });

  // Adaptar al formato que espera el componente (snake_case)
  const exercisesForComponent = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscle_group: e.muscleGroup,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">➕ Nueva Rutina</h1>
          <p className="text-gray-400 mt-2">
            Crea una rutina organizada por días
          </p>
        </div>
        <NewRoutineFormByDays
          exercises={exercisesForComponent}
          adminId={session.id}
        />
      </main>
    </div>
  );
}
