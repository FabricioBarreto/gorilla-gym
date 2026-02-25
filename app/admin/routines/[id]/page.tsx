import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminRoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const routine = await prisma.routine.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: {
            orderBy: { orderIndex: "asc" },
            include: {
              exercise: { select: { id: true, name: true, muscleGroup: true } },
            },
          },
        },
      },
    },
  });

  if (!routine) redirect("/admin/routines");

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/routines"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Volver a rutinas
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {routine.name}
              </h1>
              {routine.description && (
                <p className="text-gray-400">{routine.description}</p>
              )}
              <div className="flex items-center space-x-3 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    routine.category?.toLowerCase() === "hombres"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-pink-500/20 text-pink-400"
                  }`}
                >
                  {routine.category?.toLowerCase() === "hombres"
                    ? "💪 Hombres"
                    : "🏋️‍♀️ Mujeres"}
                </span>
                <span className="text-gray-400">
                  {routine.days.length} días de entrenamiento
                </span>
              </div>
            </div>
            <Link
              href={`/admin/routines/${id}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ✏️ Editar
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {routine.days.map((day) => (
            <div
              key={day.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{day.dayNumber}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {day.dayName}
                  </h3>
                  {day.description && (
                    <p className="text-gray-400 text-sm">{day.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {day.exercises.map((re) => (
                  <div
                    key={re.id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {re.orderIndex}
                        </span>
                        <div>
                          <h4 className="text-white font-bold">
                            {re.exercise.name}
                          </h4>
                          <p className="text-green-400 text-sm">
                            {re.exercise.muscleGroup}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">Series</p>
                          <p className="text-white font-bold">{re.sets}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Reps</p>
                          <p className="text-white font-bold">{re.reps}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Descanso</p>
                          <p className="text-white font-bold">
                            {re.restSeconds}s
                          </p>
                        </div>
                      </div>
                    </div>
                    {re.notes && (
                      <p className="text-gray-400 text-sm mt-3 italic">
                        💡 {re.notes}
                      </p>
                    )}
                  </div>
                ))}
                {day.exercises.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No hay ejercicios en este día
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
