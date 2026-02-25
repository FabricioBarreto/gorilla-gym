"use client";
// ============================================================
// ARCHIVO: components/admin/PriceSettings.tsx
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Price {
  id: string;
  plan_type: string;
  price: number;
  updated_at: string;
}
interface PriceSettingsProps {
  prices: Price[];
}

export function PriceSettings({ prices }: PriceSettingsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const planLabels: Record<string, string> = {
    quincenal: "Quincenal (15 días)",
    mensual: "Mensual (30 días)",
    trimestral: "Trimestral (90 días)",
    anual: "Anual (365 días)",
  };
  const planIcons: Record<string, string> = {
    quincenal: "📅",
    mensual: "📆",
    trimestral: "🗓️",
    anual: "📋",
  };
  const [localPrices, setLocalPrices] = useState<Record<string, number>>(
    prices.reduce((acc, p) => ({ ...acc, [p.plan_type]: p.price }), {}),
  );

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: localPrices }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalPrices(
      prices.reduce((acc, p) => ({ ...acc, [p.plan_type]: p.price }), {}),
    );
    setEditing(false);
    setError(null);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          💰 Precios de Membresías
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            ✏️ Editar Precios
          </button>
        )}
      </div>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-green-400 text-sm">
            ✅ Precios actualizados correctamente
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.map((price) => (
          <div
            key={price.plan_type}
            className={`rounded-lg p-5 border-2 transition-all ${editing ? "border-blue-500 bg-blue-500/5" : "border-gray-600 bg-gray-700/30"}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{planIcons[price.plan_type]}</span>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {planLabels[price.plan_type]}
                </h3>
                <p className="text-gray-400 text-xs">
                  Última actualización:{" "}
                  {new Date(price.updated_at).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
            {editing ? (
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                  Precio ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={localPrices[price.plan_type] || 0}
                  onChange={(e) =>
                    setLocalPrices({
                      ...localPrices,
                      [price.plan_type]: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Precio Actual</p>
                <p className="text-green-400 font-bold text-3xl">
                  ${price.price.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "Guardando..." : "💾 Guardar Cambios"}
          </button>
        </div>
      )}
    </div>
  );
}
