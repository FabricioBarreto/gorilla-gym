import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export async function ExpirationAlerts() {
  const supabase = await createServerSupabaseClient();

  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // Membresías que vencen en los próximos 3 días
  const { data: criticalExpiring } = await supabase
    .from("memberships")
    .select(
      `
      *,
      profile:profiles!memberships_user_id_fkey (
        id,
        full_name,
        dni
      )
    `,
    )
    .eq("status", "active")
    .gte("end_date", today.toISOString().split("T")[0])
    .lte("end_date", threeDaysFromNow.toISOString().split("T")[0])
    .order("end_date", { ascending: true });

  // Membresías que vencen en 4-7 días
  const { data: warningExpiring } = await supabase
    .from("memberships")
    .select(
      `
      *,
      profile:profiles!memberships_user_id_fkey (
        id,
        full_name,
        dni
      )
    `,
    )
    .eq("status", "active")
    .gt("end_date", threeDaysFromNow.toISOString().split("T")[0])
    .lte("end_date", sevenDaysFromNow.toISOString().split("T")[0])
    .order("end_date", { ascending: true });

  // Membresías ya vencidas
  const { data: expired } = await supabase
    .from("memberships")
    .select(
      `
      *,
      profile:profiles!memberships_user_id_fkey (
        id,
        full_name,
        dni
      )
    `,
    )
    .eq("status", "active")
    .lt("end_date", today.toISOString().split("T")[0])
    .order("end_date", { ascending: false });

  const getDaysUntilExpiration = (endDate: string) => {
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalAlerts =
    (criticalExpiring?.length || 0) +
    (warningExpiring?.length || 0) +
    (expired?.length || 0);

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Vencidas */}
      {expired && expired.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="text-red-400 font-bold">Membresías Vencidas</h3>
                <p className="text-red-300 text-sm">
                  {expired.length} alumno{expired.length !== 1 ? "s" : ""} con
                  membresía vencida
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expired.map((membership) => {
              const daysAgo = Math.abs(
                getDaysUntilExpiration(membership.end_date),
              );
              return (
                <Link
                  key={membership.id}
                  href={`/admin/members/${membership.profile?.id}`}
                  className="block bg-red-900/20 hover:bg-red-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {membership.profile?.full_name}
                      </p>
                      <p className="text-red-300 text-sm">
                        DNI: {membership.profile?.dni || "N/A"} • Vencida hace{" "}
                        {daysAgo} día{daysAgo !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-red-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Críticas (0-3 días) */}
      {criticalExpiring && criticalExpiring.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-orange-400 font-bold">
                  Vencen en 3 días o menos
                </h3>
                <p className="text-orange-300 text-sm">
                  {criticalExpiring.length} membresía
                  {criticalExpiring.length !== 1 ? "s" : ""} próxima
                  {criticalExpiring.length !== 1 ? "s" : ""} a vencer
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {criticalExpiring.map((membership) => {
              const days = getDaysUntilExpiration(membership.end_date);
              return (
                <Link
                  key={membership.id}
                  href={`/admin/members/${membership.profile?.id}`}
                  className="block bg-orange-900/20 hover:bg-orange-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {membership.profile?.full_name}
                      </p>
                      <p className="text-orange-300 text-sm">
                        DNI: {membership.profile?.dni || "N/A"} • Vence en{" "}
                        {days} día{days !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-orange-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Advertencia (4-7 días) */}
      {warningExpiring && warningExpiring.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⏰</span>
              <div>
                <h3 className="text-yellow-400 font-bold">
                  Vencen próximamente (4-7 días)
                </h3>
                <p className="text-yellow-300 text-sm">
                  {warningExpiring.length} membresía
                  {warningExpiring.length !== 1 ? "s" : ""} a renovar pronto
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {warningExpiring.map((membership) => {
              const days = getDaysUntilExpiration(membership.end_date);
              return (
                <Link
                  key={membership.id}
                  href={`/admin/members/${membership.profile?.id}`}
                  className="block bg-yellow-900/20 hover:bg-yellow-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {membership.profile?.full_name}
                      </p>
                      <p className="text-yellow-300 text-sm">
                        DNI: {membership.profile?.dni || "N/A"} • Vence en{" "}
                        {days} días
                      </p>
                    </div>
                    <span className="text-yellow-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
