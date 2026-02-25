import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MembersList } from "@/components/admin/MembersList";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function MembersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const allMembers = await prisma.profile.findMany({
    where: { role: "member" },
    orderBy: { createdAt: "desc" },
  });

  const membersWithMemberships = await Promise.all(
    allMembers.map(async (member) => {
      const membership = await prisma.membership.findFirst({
        where: { userId: member.id, status: "active" },
        orderBy: { endDate: "desc" },
        select: {
          id: true,
          planType: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      });

      return {
        ...member,
        full_name: member.fullName,
        created_at: member.createdAt.toISOString(),
        phone: member.phone ?? undefined,
        memberships: membership
          ? [
              {
                id: membership.id,
                plan_type: membership.planType,
                start_date: membership.startDate.toISOString().split("T")[0],
                end_date: membership.endDate.toISOString().split("T")[0],
                status: membership.status as "active" | "expired" | "suspended",
              },
            ]
          : [],
      };
    }),
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestión de Alumnos
            </h1>
            <p className="text-gray-400 mt-2">
              Administra todos los miembros del gimnasio
            </p>
          </div>
          <Link
            href="/admin/members/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Agregar Alumno</span>
          </Link>
        </div>
        <MembersList members={membersWithMemberships} />
      </main>
    </div>
  );
}
