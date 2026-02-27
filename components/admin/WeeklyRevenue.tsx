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
    const dateKey = dateObj.toISOString().split("T")[0];
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Ingresos de la Semana
      </h2>

      {/* Cards totales - stack en mobile, grid en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between">
          <p className="text-green-400 text-sm">Total Semanal</p>
          <p className="text-white text-xl sm:text-2xl font-bold mt-0 sm:mt-1">
            ${totalWeek.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between">
          <p className="text-purple-400 text-sm">Efectivo</p>
          <p className="text-white text-xl font-bold mt-0 sm:mt-1">
            ${totalEfectivo.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between">
          <p className="text-blue-400 text-sm">Transferencia</p>
          <p className="text-white text-xl font-bold mt-0 sm:mt-1">
            ${totalTransferencia.toLocaleString()}
          </p>
        </div>
      </div>

      {days.length > 0 ? (
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.dateKey}
              className="bg-gray-700/30 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-medium capitalize truncate">
                    {day.label}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {day.count} renovacion{day.count !== 1 ? "es" : ""}
                  </p>
                </div>
                <p className="text-green-400 font-bold text-lg sm:text-xl flex-shrink-0">
                  ${day.total.toLocaleString()}
                </p>
              </div>
              {(day.efectivo > 0 || day.transferencia > 0) && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                  {day.efectivo > 0 && (
                    <span>💵 ${day.efectivo.toLocaleString()}</span>
                  )}
                  {day.transferencia > 0 && (
                    <span>🏦 ${day.transferencia.toLocaleString()}</span>
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
