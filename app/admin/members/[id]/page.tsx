import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MemberDetailHeader } from "@/components/admin/MemberDetailHeader";
import { MemberMembershipSimple } from "@/components/admin/MemberMembershipSimple";
import { AssignRoutineButton } from "@/components/admin/AssignRoutineButton";
import { MembershipHistory } from "@/components/admin/MembershipHistory";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import prisma from "@/lib/prisma";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const member = await prisma.profile.findUnique({ where: { id } });
  if (!member) redirect("/admin/members");

  const [membership, allMemberships, routineAssignment, availableRoutines] =
    await Promise.all([
      prisma.membership.findFirst({
        where: { userId: id, status: "active" },
        orderBy: { endDate: "desc" },
      }),
      prisma.membership.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.routineAssignment.findFirst({
        where: { userId: id },
        orderBy: { assignedAt: "desc" },
        include: { routine: { select: { id: true, name: true } } },
      }),
      prisma.routine.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  // Mapear camelCase de Prisma → snake_case que esperan los componentes
  const memberForComponent = {
    ...member,
    full_name: member.fullName,
    created_at: member.createdAt.toISOString(),
    phone: member.phone ?? undefined,
  };

  const membershipForComponent = membership
    ? {
        ...membership,
        plan_type: membership.planType,
        start_date: membership.startDate.toISOString().split("T")[0],
        end_date: membership.endDate.toISOString().split("T")[0],
        created_at: membership.createdAt.toISOString(),
        status: membership.status as "active" | "expired" | "suspended",
      }
    : null;

  const membershipsForComponent = allMemberships.map((m) => ({
    ...m,
    plan_type: m.planType,
    start_date: m.startDate.toISOString().split("T")[0],
    end_date: m.endDate.toISOString().split("T")[0],
    created_at: m.createdAt.toISOString(),
    status: m.status as "active" | "expired" | "suspended",
    payment_method: m.paymentMethod ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemberDetailHeader member={memberForComponent} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MemberMembershipSimple
            membership={membershipForComponent}
            memberId={member.id}
          />
          <AssignRoutineButton
            memberId={member.id}
            currentRoutine={routineAssignment?.routine || null}
            availableRoutines={availableRoutines}
          />
        </div>
        <div className="mt-6">
          <MembershipHistory
            memberships={membershipsForComponent}
            memberName={member.fullName}
          />
        </div>
        <div className="mt-6">
          <DeleteUserButton memberId={member.id} memberName={member.fullName} />
        </div>
      </main>
    </div>
  );
}
