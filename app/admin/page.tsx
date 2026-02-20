import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatsCards } from "@/components/admin/StatsCards";
import { ExpirationAlerts } from "@/components/admin/ExpirationAlerts";
import { WeeklyRevenue } from "@/components/admin/WeeklyRevenue";
import { RecentRenewals } from "@/components/admin/RecentRenewals";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener estadísticas
  const { count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "member");

  const { count: activeMembers } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Obtener precios desde la BD
  const { data: pricesData } = await supabase
    .from("membership_prices")
    .select("plan_type, price");

  const prices: Record<string, number> = pricesData?.reduce(
    (acc, p) => ({ ...acc, [p.plan_type]: p.price }),
    {},
  ) || {
    quincenal: 8000,
    mensual: 15000,
    trimestral: 40000,
    anual: 150000,
  };

  // INGRESOS DEL MES
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: monthlyMemberships } = await supabase
    .from("memberships")
    .select("plan_type")
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString());

  const monthlyRevenue =
    monthlyMemberships?.reduce(
      (sum, m) => sum + (prices[m.plan_type] || 0),
      0,
    ) || 0;

  // INGRESOS DE LA SEMANA
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: weeklyMemberships } = await supabase
    .from("memberships")
    .select("id, plan_type, payment_method, created_at")
    .gte("created_at", oneWeekAgo.toISOString())
    .order("created_at", { ascending: false });

  // Últimas 10 renovaciones
  // ✅ AHORA (correcto)
  const { data: recentRenewals } = await supabase
    .from("memberships")
    .select(
      `
    id,
    plan_type,
    payment_method,
    created_at,
    profiles!user_id (
      id,
      full_name,
      dni
    )
  `,
    )
    .order("created_at", { ascending: false })
    .limit(5);
    
  const stats = {
    totalMembers: totalMembers || 0,
    activeMembers: activeMembers || 0,
    monthlyRevenue,
    totalPayments: monthlyMemberships?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Bienvenido al panel de administración
          </p>
        </div>

        {/* Alertas de Vencimiento */}
        <div className="mb-8">
          <ExpirationAlerts />
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Ingresos + Renovaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyRevenue
            memberships={weeklyMemberships || []}
            prices={prices}
          />

          <RecentRenewals renewals={recentRenewals || []} prices={prices} />
        </div>
      </main>
    </div>
  );
}
