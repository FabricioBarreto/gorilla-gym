// ============================================================
// ARCHIVO: app/dashboard/routine/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import { OfflineRoutinesLoader } from "@/components/user/OfflineRoutinesLoader";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function UserRoutinePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const profile = await prisma.profile.findUnique({
    where: { id: session.id },
    select: { fullName: true },
  });

  const routines = await prisma.routine.findMany({
    orderBy: { name: "asc" },
    include: { days: { include: { exercises: { select: { id: true } } } } },
  });

  const routinesForComponent = routines.map((r) => ({
    ...r,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    routine_days: r.days.map((d) => ({
      id: d.id,
      routine_exercises: d.exercises.map((e) => ({ id: e.id })),
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
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
        <OfflineRoutinesLoader
          initialRoutines={routinesForComponent}
          userId={session.id}
        />
      </main>
    </div>
  );
}
