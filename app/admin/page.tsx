import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatsCards } from "@/components/admin/StatsCards";
import { ExpirationAlerts } from "@/components/admin/ExpirationAlerts";
import { WeeklyRevenue } from "@/components/admin/WeeklyRevenue";
import { RecentRenewals } from "@/components/admin/RecentRenewals";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const [
    totalMembers,
    activeMembers,
    pricesData,
    monthlyMemberships,
    weeklyMemberships,
    recentRenewals,
  ] = await Promise.all([
    prisma.profile.count({ where: { role: "member" } }),
    prisma.membership.count({ where: { status: "active" } }),
    prisma.membershipPrice.findMany({
      select: { planType: true, price: true },
    }),
    prisma.membership.findMany({
      where: { createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
      select: { planType: true },
    }),
    prisma.membership.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      select: {
        id: true,
        planType: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membership.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        planType: true,
        paymentMethod: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, dni: true } },
      },
    }),
  ]);

  // Construir mapa de precios
  const prices: Record<string, number> = pricesData.reduce(
    (acc, p) => ({ ...acc, [p.planType]: p.price }),
    { mensual: 15000, trimestral: 40000, anual: 150000 },
  );

  const monthlyRevenue = monthlyMemberships.reduce(
    (sum, m) => sum + (prices[m.planType] || 0),
    0,
  );

  const stats = {
    totalMembers,
    activeMembers,
    monthlyRevenue,
    totalPayments: monthlyMemberships.length,
  };

  // Adaptar tipos para WeeklyRevenue (usa snake_case internamente)
  const weeklyForComponent = weeklyMemberships.map((m) => ({
    id: m.id,
    plan_type: m.planType,
    created_at: m.createdAt.toISOString(),
    payment_method: m.paymentMethod ?? undefined,
  }));

  // Adaptar tipos para RecentRenewals
  const renewalsForComponent = recentRenewals.map((m) => ({
    id: m.id,
    plan_type: m.planType,
    payment_method: m.paymentMethod ?? "",
    created_at: m.createdAt.toISOString(),
    profiles: [{ id: m.user.id, full_name: m.user.fullName, dni: m.user.dni }],
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Bienvenido al panel de administración
          </p>
        </div>

        <div className="mb-8">
          <ExpirationAlerts />
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyRevenue memberships={weeklyForComponent} prices={prices} />
          <RecentRenewals renewals={renewalsForComponent} prices={prices} />
        </div>
      </main>
    </div>
  );
}
