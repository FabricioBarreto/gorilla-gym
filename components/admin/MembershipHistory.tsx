"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDates, setEditDates] = useState<{
    start_date: string;
    end_date: string;
  }>({ start_date: "", end_date: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const planLabels: Record<string, string> = {
    quincenal: "Quincenal",
    mensual: "Mensual",
    diario: "Día",
    semanal: "Semanal",
    // compatibilidad planes viejos
    trimestral: "Trimestral",
    anual: "Anual",
  };

  const planPrices: Record<string, number> = {
    diario: 2000,
    semanal: 6000,
    quincenal: 10000,
    mensual: 18000,
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStartEdit = (m: Membership) => {
    setEditingId(m.id);
    setEditDates({ start_date: m.start_date, end_date: m.end_date });
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (membershipId: string) => {
    setSavingId(membershipId);
    setEditError(null);
    try {
      const res = await fetch(`/api/memberships/${membershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSavingId(null);
    }
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

      {/* Estadísticas */}
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
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {memberships.map((membership, index) => {
          const isEditing = editingId === membership.id;
          const isSaving = savingId === membership.id;
          const currentStart = isEditing
            ? editDates.start_date
            : membership.start_date;
          const currentEnd = isEditing
            ? editDates.end_date
            : membership.end_date;
          const duration = getDuration(currentStart, currentEnd);
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
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-2xl">
                      ${amount.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      ${duration > 0 ? (amount / duration).toFixed(0) : "—"}/día
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(membership)}
                      className="ml-3 p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Editar fechas"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>

              {/* Error de edición */}
              {isEditing && editError && (
                <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{editError}</p>
                </div>
              )}

              {/* Fechas — modo edición o lectura */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Inicio</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDates.start_date}
                      onChange={(e) =>
                        setEditDates({
                          ...editDates,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 border border-blue-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <p className="text-white font-medium text-sm">
                      {new Date(
                        membership.start_date + "T12:00:00",
                      ).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Vencimiento</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDates.end_date}
                      onChange={(e) =>
                        setEditDates({
                          ...editDates,
                          end_date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 border border-blue-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <p className="text-white font-medium text-sm">
                      {new Date(
                        membership.end_date + "T12:00:00",
                      ).toLocaleDateString("es-AR")}
                    </p>
                  )}
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

              {/* Botones de edición */}
              {isEditing && (
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-600">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 text-sm disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveEdit(membership.id)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 font-medium"
                  >
                    {isSaving ? "Guardando..." : "💾 Guardar fechas"}
                  </button>
                </div>
              )}

              {/* Footer */}
              {!isEditing && (
                <div className="pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      ID: {membership.id.slice(0, 8)}...
                    </span>
                    {membership.status === "active" && (
                      <span className="text-green-400 font-medium">
                        ✅ Vigente hasta{" "}
                        {new Date(
                          membership.end_date + "T12:00:00",
                        ).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </div>
                </div>
              )}
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
