"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Plan {
  plan_type: string;
  price: number;
}

interface NewMemberFormProps {
  plans: Plan[];
}

const planDurations: Record<string, number> = {
  quincenal: 15,
  mensual: 30,
  trimestral: 90,
  anual: 365,
};

const planLabels: Record<string, string> = {
  quincenal: "Quincenal",
  mensual: "Mensual",
  trimestral: "Trimestral",
  anual: "Anual",
};

export function NewMemberForm({ plans }: NewMemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPlan = plans[0]?.plan_type || "mensual";
  const defaultPrice = plans[0]?.price || 0;

  const [formData, setFormData] = useState({
    full_name: "",
    dni: "",
    phone: "",
    password: "",
    plan_type: defaultPlan,
    start_date: new Date().toISOString().split("T")[0],
    amount: defaultPrice,
  });

  const getPriceForPlan = (planType: string) =>
    plans.find((p) => p.plan_type === planType)?.price || 0;

  const handlePlanChange = (plan: string) => {
    setFormData({
      ...formData,
      plan_type: plan,
      amount: getPriceForPlan(plan),
    });
  };

  const calculateEndDate = (startDate: string, planType: string) => {
    const end = new Date(startDate + "T12:00:00");
    const days = planDurations[planType];
    if (days) {
      end.setDate(end.getDate() + days);
    } else if (planType === "mensual") {
      end.setMonth(end.getMonth() + 1);
    } else if (planType === "trimestral") {
      end.setMonth(end.getMonth() + 3);
    } else if (planType === "anual") {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!/^\d{7,8}$/.test(formData.dni))
        throw new Error("El DNI debe tener 7 u 8 dígitos");

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/admin/members");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear el alumno");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
    >
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                DNI *
              </label>
              <input
                type="text"
                required
                pattern="\d{7,8}"
                maxLength={8}
                value={formData.dni}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dni: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="12345678"
              />
              <p className="text-gray-400 text-xs mt-1">
                7 u 8 dígitos sin puntos
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+54 9 362 4123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña Inicial *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            💳 Membresía Inicial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="text"
                disabled
                value={calculateEndDate(
                  formData.start_date,
                  formData.plan_type,
                )}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.plan_type}
                type="button"
                onClick={() => handlePlanChange(plan.plan_type)}
                className={`p-4 rounded-lg border-2 transition-all ${formData.plan_type === plan.plan_type ? "border-green-500 bg-green-500/10" : "border-gray-600 bg-gray-700 hover:border-gray-500"}`}
              >
                <div className="text-center">
                  <p className="text-white font-bold capitalize mb-2">
                    {planLabels[plan.plan_type] || plan.plan_type}
                  </p>
                  <p className="text-xl font-bold text-green-400">
                    ${plan.price.toLocaleString()}
                  </p>
                  {planDurations[plan.plan_type] && (
                    <p className="text-gray-400 text-xs mt-1">
                      {planDurations[plan.plan_type]} días
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">💰 Pago Inicial</h2>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Monto a pagar</p>
                <p className="text-white text-3xl font-bold">
                  ${formData.amount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  Plan {planLabels[formData.plan_type] || formData.plan_type}
                </p>
                <p className="text-gray-400 text-sm">
                  Válido hasta{" "}
                  {calculateEndDate(formData.start_date, formData.plan_type)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Nota:</strong> El alumno ingresará con su DNI (
            {formData.dni || "sin definir"}) y la contraseña que configures.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Alumno"}
          </button>
        </div>
      </div>
    </form>
  );
}
