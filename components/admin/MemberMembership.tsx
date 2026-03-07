"use client";
// ============================================================
// ARCHIVO: components/admin/MemberMembership.tsx
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Membership {
  id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "suspended";
}

export function MemberMembershipSimple({
  membership,
  memberId,
}: {
  membership: Membership | null;
  memberId: string;
}) {
  const router = useRouter();
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("mensual");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const planPrices: Record<string, number> = {
    diario: 2000,
    semanal: 6000,
    quincenal: 10000,
    mensual: 18000,
  };

  const planLabels: Record<string, string> = {
    diario: "Día (1 día)",
    semanal: "Semanal (7 días)",
    quincenal: "Quincenal (15 días)",
    mensual: "Mensual (30 días)",
  };

  const planDurations: Record<string, number> = {
    diario: 1,
    semanal: 7,
    quincenal: 15,
    mensual: 30,
  };

  const calculateEndDate = (planType: string, from: string) => {
    const end = new Date(from + "T12:00:00");
    if (planType === "diario") end.setDate(end.getDate() + 1);
    else if (planType === "semanal") end.setDate(end.getDate() + 7);
    else if (planType === "quincenal") end.setDate(end.getDate() + 15);
    else if (planType === "mensual") end.setMonth(end.getMonth() + 1);
    return end.toISOString().split("T")[0];
  };

  const handleRenew = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberId,
          planType: selectedPlan,
          startDate: startDate,
          currentMembershipId: membership?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowRenewForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!membership) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(membership.end_date);
    endDate.setHours(0, 0, 0, 0);
    return Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const getStatusDisplay = () => {
    const d = getDaysRemaining();
    if (d === null)
      return { color: "text-gray-400", text: "Sin membresía", icon: "❌" };
    if (d < 0)
      return {
        color: "text-red-400",
        text: `Venció hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? "s" : ""}`,
        icon: "❌",
      };
    if (d === 0)
      return { color: "text-orange-400", text: "Vence HOY", icon: "⚠️" };
    if (d <= 3)
      return {
        color: "text-orange-400",
        text: `Vence en ${d} día${d !== 1 ? "s" : ""}`,
        icon: "⚠️",
      };
    return { color: "text-green-400", text: `${d} días restantes`, icon: "✅" };
  };

  const status = getStatusDisplay();
  const daysRemaining = getDaysRemaining();
  const endDatePreview = calculateEndDate(selectedPlan, startDate);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">💳 Membresía</h2>
        {!showRenewForm && (
          <button
            onClick={() => setShowRenewForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            {membership ? "🔄 Renovar" : "➕ Crear"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {showRenewForm ? (
        <div className="space-y-5">
          {/* Fecha de inicio editable */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              📅 Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-gray-400 text-xs mt-2">
              Podés cambiar la fecha si el pago corresponde a otro día
            </p>
          </div>

          {/* Selector de plan */}
          <div className="space-y-3">
            {Object.entries(planPrices).map(([plan, price]) => (
              <button
                key={plan}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPlan === plan
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPlan === plan
                        ? "border-green-500 bg-green-500"
                        : "border-gray-500"
                    }`}
                  >
                    {selectedPlan === plan && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </span>
                  <p className="text-white font-bold text-lg">
                    {planLabels[plan]}
                  </p>
                </div>
                <div className="ml-8 space-y-1">
                  <p className="text-green-400 font-bold text-xl">
                    ${price.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Duración: {planDurations[plan]} día
                    {planDurations[plan] !== 1 ? "s" : ""}
                  </p>
                  {selectedPlan === plan && (
                    <p className="text-blue-400 text-sm font-medium">
                      Vence:{" "}
                      {new Date(
                        endDatePreview + "T12:00:00",
                      ).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setShowRenewForm(false);
                setError(null);
                setStartDate(new Date().toISOString().split("T")[0]);
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRenew}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 font-medium"
            >
              {loading
                ? "Procesando..."
                : membership
                  ? "Confirmar Renovación"
                  : "Crear Membresía"}
            </button>
          </div>
        </div>
      ) : membership ? (
        <div className="space-y-6">
          <div
            className={`rounded-lg p-6 text-center border-2 ${
              daysRemaining! < 0
                ? "bg-red-500/10 border-red-500"
                : daysRemaining! <= 3
                  ? "bg-orange-500/10 border-orange-500"
                  : "bg-green-500/10 border-green-500"
            }`}
          >
            <p className="text-gray-300 text-sm mb-2">Estado de Membresía</p>
            <p className={`text-4xl font-bold mb-2 ${status.color}`}>
              {status.icon}
            </p>
            <p className={`text-2xl font-bold ${status.color}`}>
              {status.text}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Plan</p>
              <p className="text-white font-bold text-lg">
                {planLabels[membership.plan_type] || membership.plan_type}
              </p>
              <p className="text-green-400 font-semibold">
                ${planPrices[membership.plan_type]?.toLocaleString() || "-"}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Fecha de Vencimiento</p>
              <p className="text-white font-bold text-lg">
                {new Date(membership.end_date).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Inicio de Membresía</p>
            <p className="text-white">
              {new Date(membership.start_date).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4 text-6xl">🏋️</div>
          <p className="text-gray-400 text-lg mb-4">
            Este alumno no tiene membresía
          </p>
          <button
            onClick={() => setShowRenewForm(true)}
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Crear membresía →
          </button>
        </div>
      )}
    </div>
  );
}
