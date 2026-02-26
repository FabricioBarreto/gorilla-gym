"use client";

interface Membership {
  id: string;
  plan_type: string;
  created_at: string;
  payment_method?: string;
  amount?: number;
}

interface WeeklyRevenueProps {
  memberships: Membership[];
  prices: Record<string, number>;
}

export function WeeklyRevenue({ memberships, prices }: WeeklyRevenueProps) {
  const revenueByDay: Record<
    string,
    {
      total: number;
      count: number;
      efectivo: number;
      transferencia: number;
      dateObj: Date;
    }
  > = {};

  memberships.forEach((m) => {
    const dateObj = new Date(m.created_at);
    const dateKey = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD para ordenar
    const dateLabel = dateObj.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    if (!revenueByDay[dateKey]) {
      revenueByDay[dateKey] = {
        total: 0,
        count: 0,
        efectivo: 0,
        transferencia: 0,
        dateObj,
      };
    }

    // Usar amount guardado si existe, si no usar precio actual
    const amount = m.amount ?? prices[m.plan_type] ?? 0;
    revenueByDay[dateKey].total += amount;
    revenueByDay[dateKey].count += 1;

    if (m.payment_method === "efectivo") {
      revenueByDay[dateKey].efectivo += amount;
    } else if (m.payment_method === "transferencia") {
      revenueByDay[dateKey].transferencia += amount;
    }
  });

  const totalWeek = memberships.reduce(
    (sum, m) => sum + (m.amount ?? prices[m.plan_type] ?? 0),
    0,
  );
  const totalEfectivo = memberships
    .filter((m) => m.payment_method === "efectivo")
    .reduce((sum, m) => sum + (m.amount ?? prices[m.plan_type] ?? 0), 0);
  const totalTransferencia = memberships
    .filter((m) => m.payment_method === "transferencia")
    .reduce((sum, m) => sum + (m.amount ?? prices[m.plan_type] ?? 0), 0);

  // Ordenar por fecha descendente (mas reciente primero)
  const days = Object.entries(revenueByDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, data]) => ({
      dateKey,
      label: data.dateObj.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
      ...data,
    }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        Ingresos de la Semana
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-1">Total Semanal</p>
          <p className="text-white text-2xl font-bold">
            ${totalWeek.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-400 text-sm mb-1">Efectivo</p>
          <p className="text-white text-xl font-bold">
            ${totalEfectivo.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-1">Transferencia</p>
          <p className="text-white text-xl font-bold">
            ${totalTransferencia.toLocaleString()}
          </p>
        </div>
      </div>

      {days.length > 0 ? (
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day.dateKey} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium capitalize">
                    {day.label}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {day.count} renovacion{day.count !== 1 ? "es" : ""}
                  </p>
                </div>
                <p className="text-green-400 font-bold text-xl">
                  ${day.total.toLocaleString()}
                </p>
              </div>
              {(day.efectivo > 0 || day.transferencia > 0) && (
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                  {day.efectivo > 0 && (
                    <span>Efectivo: ${day.efectivo.toLocaleString()}</span>
                  )}
                  {day.transferencia > 0 && (
                    <span>
                      Transferencia: ${day.transferencia.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay ingresos esta semana</p>
        </div>
      )}
    </div>
  );
}
