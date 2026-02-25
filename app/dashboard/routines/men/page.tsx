// ============================================================
// ARCHIVO: app/dashboard/routines/men/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function MenRoutinesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, routines] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    }),
    prisma.routine.findMany({
      where: { category: { equals: "Hombres", mode: "insensitive" } },
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            💪 Rutinas Hombres
          </h1>
          <p className="text-gray-400">Selecciona una rutina para comenzar</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.length > 0 ? (
            routines.map((routine) => (
              <Link
                key={routine.id}
                href={`/dashboard/routines/men/${routine.id}`}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-blue-500 rounded-xl p-6 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">🏋️</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {routine.name}
                </h3>
                {routine.description && (
                  <p className="text-gray-400 text-sm">{routine.description}</p>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No hay rutinas disponibles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
