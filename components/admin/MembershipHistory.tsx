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
  memberName: string;
}

export function MembershipHistory({
  memberships,
  memberName,
}: MembershipHistoryProps) {
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

  const paymentMethodLabels: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
  };

  const paymentMethodIcons: Record<string, string> = {
    efectivo: "💵",
    transferencia: "🏦",
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const isExpired = end < today || status === "expired";

    if (status === "active" && !isExpired) {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
          ✅ Activa
        </span>
      );
    }
    if (isExpired || status === "expired") {
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
          ⏳ Finalizada
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
        ❌ Suspendida
      </span>
    );
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (memberships.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📜 Historial de Renovaciones
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No hay registros de renovaciones</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalPagado = memberships.reduce(
    (sum, m) => sum + (planPrices[m.plan_type] || 0),
    0,
  );
  const totalRenovaciones = memberships.length;
  const porEfectivo = memberships.filter(
    (m) => m.payment_method === "efectivo",
  ).length;
  const porTransferencia = memberships.filter(
    (m) => m.payment_method === "transferencia",
  ).length;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        📜 Historial de Renovaciones
      </h2>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-1">Total Renovaciones</p>
          <p className="text-white text-2xl font-bold">{totalRenovaciones}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-1">Total Recaudado</p>
          <p className="text-white text-2xl font-bold">
            ${totalPagado.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-400 text-sm mb-1">💵 Efectivo</p>
          <p className="text-white text-2xl font-bold">{porEfectivo}</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-orange-400 text-sm mb-1">🏦 Transferencia</p>
          <p className="text-white text-2xl font-bold">{porTransferencia}</p>
        </div>
      </div>

      {/* Historial */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {memberships.map((membership, index) => {
          const duration = getDuration(
            membership.start_date,
            membership.end_date,
          );
          const amount = planPrices[membership.plan_type] || 0;

          return (
            <div
              key={membership.id}
              className={`rounded-lg p-5 border-2 transition-all ${
                membership.status === "active"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-gray-600 bg-gray-700/30"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      #{memberships.length - index}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-bold text-lg">
                        {planLabels[membership.plan_type] ||
                          membership.plan_type}
                      </h3>
                      {getStatusBadge(membership.status, membership.end_date)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Registrado el{" "}
                      {new Date(membership.created_at).toLocaleDateString(
                        "es-AR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-2xl">
                    ${amount.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    ${(amount / duration).toFixed(0)}/día
                  </p>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Inicio</p>
                  <p className="text-white font-medium text-sm">
                    {new Date(membership.start_date).toLocaleDateString(
                      "es-AR",
                    )}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Vencimiento</p>
                  <p className="text-white font-medium text-sm">
                    {new Date(membership.end_date).toLocaleDateString("es-AR")}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Duración</p>
                  <p className="text-white font-medium text-sm">
                    {duration} días
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Método de Pago</p>
                  <p className="text-white font-medium text-sm flex items-center space-x-1">
                    <span>
                      {membership.payment_method
                        ? paymentMethodIcons[membership.payment_method]
                        : "💳"}
                    </span>
                    <span className="capitalize">
                      {membership.payment_method
                        ? paymentMethodLabels[membership.payment_method]
                        : "N/E"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer con estado */}
              <div className="pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    ID: {membership.id.slice(0, 8)}...
                  </span>
                  {membership.status === "active" && (
                    <span className="text-green-400 font-medium">
                      ✅ Vigente hasta{" "}
                      {new Date(membership.end_date).toLocaleDateString(
                        "es-AR",
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen Final */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Promedio por renovación</p>
            <p className="text-white text-xl font-bold">
              ${Math.round(totalPagado / totalRenovaciones).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Última renovación</p>
            <p className="text-white font-medium">
              {new Date(memberships[0].created_at).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
