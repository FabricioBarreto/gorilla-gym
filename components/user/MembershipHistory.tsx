"use client";

interface Membership {
  id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_method?: string;
  created_at: string;
}

interface MembershipHistoryProps {
  memberships: Membership[];
}

export function MembershipHistory({ memberships }: MembershipHistoryProps) {
  const planLabels: Record<string, string> = {
    quincenal: "Quincenal",
    mensual: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  const planPrices: Record<string, number> = {
    quincenal: 8000,
    mensual: 15000,
    trimestral: 40000,
    anual: 150000,
  };

  const paymentMethodIcons: Record<string, string> = {
    efectivo: "💵",
    transferencia: "🏦",
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
          ✅ Activa
        </span>
      );
    }
    if (status === "expired") {
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
          ⏳ Vencida
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
        ❌ Suspendida
      </span>
    );
  };

  if (memberships.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📜 Historial de Pagos
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No hay registros de pagos</p>
        </div>
      </div>
    );
  }

  // Calcular total pagado
  const totalPagado = memberships.reduce(
    (sum, m) => sum + (planPrices[m.plan_type] || 0),
    0,
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">📜 Historial de Pagos</h2>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Total Pagado</p>
          <p className="text-green-400 font-bold text-xl">
            ${totalPagado.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {memberships.map((membership) => (
          <div
            key={membership.id}
            className={`rounded-lg p-4 border-2 transition-all ${
              membership.status === "active"
                ? "border-green-500/30 bg-green-500/5"
                : "border-gray-600 bg-gray-700/30"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-bold">
                    {planLabels[membership.plan_type] || membership.plan_type}
                  </h3>
                  {getStatusBadge(membership.status)}
                </div>
                <p className="text-gray-400 text-sm">
                  {new Date(membership.start_date).toLocaleDateString("es-AR")}{" "}
                  - {new Date(membership.end_date).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-lg">
                  ${planPrices[membership.plan_type]?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {membership.payment_method
                    ? paymentMethodIcons[membership.payment_method]
                    : "💳"}
                </span>
                <span className="text-gray-300 text-sm capitalize">
                  {membership.payment_method || "No especificado"}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                {new Date(membership.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
