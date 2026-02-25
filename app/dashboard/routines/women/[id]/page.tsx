// ============================================================
// ARCHIVO: app/dashboard/routines/women/[id]/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function WomenRoutineDaysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, routine, days] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    }),
    prisma.routine.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    prisma.routineDay.findMany({
      where: { routineId: id },
      orderBy: { dayNumber: "asc" },
      include: { exercises: { select: { id: true } } },
    }),
  ]);

  if (!routine) redirect("/dashboard/routines/women");

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
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
            {days.length} día{days.length !== 1 ? "s" : ""} de entrenamiento
          </p>
        </div>

        {days.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => (
              <Link
                key={day.id}
                href={`/dashboard/routines/women/${id}/day/${day.dayNumber}`}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-pink-500 rounded-xl p-6 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="text-pink-400 font-bold text-sm">
                      DÍA {day.dayNumber}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors mt-1">
                      {day.dayName}
                    </h3>
                  </div>
                </div>
                {day.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {day.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">
                    {day.exercises.length} ejercicio
                    {day.exercises.length !== 1 ? "s" : ""}
                  </span>
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
