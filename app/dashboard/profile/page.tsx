import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { MembershipStatus } from "@/components/user/MembershipStatus";
import { MembershipHistory } from "@/components/user/MembershipHistory";
import { ChangePasswordButton } from "@/components/user/ChangePasswordButton";
import prisma from "@/lib/prisma";

export default async function UserProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, membership, allMemberships] = await Promise.all([
    prisma.profile.findUnique({ where: { id: session.id } }),
    prisma.membership.findFirst({
      where: { userId: session.id, status: "active" },
      orderBy: { endDate: "desc" },
    }),
    prisma.membership.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allMembershipsForComponent = allMemberships.map((m) => ({
    ...m,
    plan_type: m.planType,
    start_date: m.startDate.toISOString(),
    end_date: m.endDate.toISOString(),
    created_at: m.createdAt.toISOString(),
    payment_method: m.paymentMethod ?? undefined,
    user_id: m.userId,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">👤 Mi Perfil</h1>
            <p className="text-gray-400 mt-2">
              Gestiona tu información personal y membresía
            </p>
          </div>
          <ChangePasswordButton />
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Nombre Completo</p>
              <p className="text-white font-medium">{profile?.fullName}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">DNI</p>
              <p className="text-white font-medium">{profile?.dni}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Teléfono</p>
              <p className="text-white font-medium">
                {profile?.phone || "No especificado"}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Miembro desde</p>
              <p className="text-white font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MembershipStatus
              membership={
                membership
                  ? {
                      ...membership,
                      plan_type: membership.planType,
                      start_date: membership.startDate.toISOString(),
                      end_date: membership.endDate.toISOString(),
                      status: membership.status,
                    }
                  : null
              }
            />
          </div>
          <div>
            <MembershipHistory memberships={allMembershipsForComponent} />
          </div>
        </div>
      </main>
    </div>
  );
}
