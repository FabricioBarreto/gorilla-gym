// ============================================================
// ARCHIVO: app/admin/routines/[id]/assign/page.tsx
// ============================================================
import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";
import { AssignMembersForm } from "@/components/admin/AssignMembersForm";
import prisma from "@/lib/prisma";

export default async function AssignRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const [routine, members, currentAssignments] = await Promise.all([
    prisma.routine.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    prisma.profile.findMany({
      where: { role: "member" },
      select: { id: true, fullName: true, dni: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.routineAssignment.findMany({
      where: { routineId: id },
      select: { userId: true },
    }),
  ]);

  if (!routine) redirect("/admin/routines");

  const assignedUserIds = currentAssignments.map((a) => a.userId);

  const membersForComponent = members.map((m) => ({
    id: m.id,
    full_name: m.fullName,
    dni: m.dni,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/admin/routines/${id}`}
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a la rutina
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Asignar: {routine.name}
          </h1>
          <p className="text-gray-400 mt-2">
            Seleccioná los alumnos a los que querés asignar esta rutina
          </p>
        </div>
        <AssignMembersForm
          routineId={id}
          routineName={routine.name}
          members={membersForComponent}
          assignedUserIds={assignedUserIds}
          adminId={session.id}
        />
      </main>
    </div>
  );
}
