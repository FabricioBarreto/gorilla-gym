"use client";
// ============================================================
// ARCHIVO: components/admin/ResetPasswordButton.tsx
// ============================================================
import { useState } from "react";

interface ResetPasswordButtonProps {
  userId: string;
  userEmail: string;
  userName: string;
}

export function ResetPasswordButton({
  userId,
  userName,
}: ResetPasswordButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  };

  const handleReset = async () => {
    if (!tempPassword.trim()) {
      setError("Debes ingresar una contraseña");
      return;
    }
    if (tempPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!confirm(`¿Estás seguro de resetear la contraseña de ${userName}?`))
      return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: tempPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewPassword(tempPassword);
      setTempPassword("");
      setTimeout(() => {
        setShowForm(false);
        setNewPassword(null);
      }, 30000);
    } catch (err: any) {
      setError(err.message || "Error al resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
      >
        🔑 Resetear Contraseña
      </button>
    );
  }

  return (
    <div className="bg-gray-800 border border-orange-500/50 rounded-lg p-6 mt-4">
      <h3 className="text-xl font-bold text-white mb-4">
        🔑 Resetear Contraseña
      </h3>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {newPassword ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-3">
              ✅ Contraseña actualizada exitosamente para {userName}
            </p>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-400 text-xs mb-2">Nueva Contraseña:</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-lg">{newPassword}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(newPassword)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  📋 Copiar
                </button>
              </div>
            </div>
            <p className="text-yellow-400 text-xs mt-3">
              ⚠️ Guarda esta contraseña ahora. Desaparecerá en 30 segundos.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setNewPassword(null);
            }}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              ⚠️ Esto cambiará la contraseña de <strong>{userName}</strong>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setTempPassword(generatePassword())}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm whitespace-nowrap"
              >
                🎲 Generar
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setShowForm(false);
                setTempPassword("");
                setError(null);
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              disabled={loading || !tempPassword}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Reseteando..." : "Resetear Contraseña"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
