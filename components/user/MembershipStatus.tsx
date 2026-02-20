"use client";

interface Membership {
  id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface MembershipStatusProps {
  membership: Membership | null;
}

export function MembershipStatus({ membership }: MembershipStatusProps) {
  if (!membership) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          💳 Estado de Membresía
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No tienes una membresía activa</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const vencimiento = new Date(membership.end_date);
  vencimiento.setHours(0, 0, 0, 0);

  const inicioMembresia = new Date(membership.start_date);
  inicioMembresia.setHours(0, 0, 0, 0);

  // Calcular días restantes
  const diffTime = vencimiento.getTime() - today.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determinar estado
  let estadoColor = "bg-green-500";
  let estadoTexto = "Activa";
  let estadoIcon = "✅";

  if (diasRestantes < 0) {
    estadoColor = "bg-red-500";
    estadoTexto = "Vencida";
    estadoIcon = "❌";
  } else if (diasRestantes <= 3) {
    estadoColor = "bg-orange-500";
    estadoTexto = "Por Vencer";
    estadoIcon = "⚠️";
  }

  // Formatear fechas
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Labels de planes
  const planLabels: Record<string, string> = {
    quincenal: "Quincenal",
    mensual: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  // Montos por plan
  const planMontos: Record<string, number> = {
    quincenal: 8000,
    mensual: 15000,
    trimestral: 40000,
    anual: 150000,
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">💳 Estado de Membresía</h2>
        <span
          className={`${estadoColor} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2`}
        >
          <span>{estadoIcon}</span>
          <span>{estadoTexto}</span>
        </span>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Plan */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Plan Actual</p>
          <p className="text-white text-2xl font-bold">
            {planLabels[membership.plan_type] || membership.plan_type}
          </p>
          <p className="text-green-400 text-lg mt-1">
            ${planMontos[membership.plan_type]?.toLocaleString() || "---"}
          </p>
        </div>

        {/* Inicio */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Inicio de Membresía</p>
          <p className="text-white text-2xl font-bold">
            {formatearFecha(inicioMembresia)}
          </p>
        </div>
      </div>

      {/* Fecha de Vencimiento - DESTACADA */}
      <div
        className={`${
          diasRestantes < 0
            ? "bg-red-500/20 border-red-500"
            : diasRestantes <= 3
              ? "bg-orange-500/20 border-orange-500"
              : "bg-green-500/20 border-green-500"
        } border-2 rounded-lg p-6`}
      >
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">Fecha de Vencimiento</p>
          <p
            className={`text-4xl font-bold mb-3 ${
              diasRestantes < 0
                ? "text-red-400"
                : diasRestantes <= 3
                  ? "text-orange-400"
                  : "text-green-400"
            }`}
          >
            {formatearFecha(vencimiento)}
          </p>

          {diasRestantes < 0 ? (
            <div className="bg-red-500/30 rounded-lg p-3 inline-block">
              <p className="text-red-300 font-bold">
                ❌ Venció hace {Math.abs(diasRestantes)} día
                {Math.abs(diasRestantes) !== 1 ? "s" : ""}
              </p>
              <p className="text-red-200 text-sm mt-1">
                Acércate al gimnasio para renovar
              </p>
            </div>
          ) : diasRestantes === 0 ? (
            <div className="bg-orange-500/30 rounded-lg p-3 inline-block">
              <p className="text-orange-300 font-bold">⚠️ Vence HOY</p>
            </div>
          ) : diasRestantes <= 3 ? (
            <div className="bg-orange-500/30 rounded-lg p-3 inline-block">
              <p className="text-orange-300 font-bold">
                ⚠️ Vence en {diasRestantes} día{diasRestantes !== 1 ? "s" : ""}
              </p>
              <p className="text-orange-200 text-sm mt-1">
                Recuerda renovar a tiempo
              </p>
            </div>
          ) : (
            <div className="bg-green-500/30 rounded-lg p-3 inline-block">
              <p className="text-green-300 font-bold">
                ✅ Faltan {diasRestantes} días
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
