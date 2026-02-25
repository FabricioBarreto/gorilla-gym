"use client";
// ============================================================
// ARCHIVO: components/admin/NewAdminForm.tsx
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dni, setDni] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!dni.trim() || dni.length < 7 || dni.length > 8)
        throw new Error("El DNI debe tener 7 u 8 dígitos");
      if (!fullName.trim()) throw new Error("El nombre completo es requerido");
      if (password.length < 6)
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      if (password !== confirmPassword)
        throw new Error("Las contraseñas no coinciden");

      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/admin/admins");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            DNI *
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            required
            maxLength={8}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12345678"
          />
          <p className="text-gray-400 text-xs mt-1">Sin puntos ni espacios</p>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Contraseña *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Creando..." : "Crear Administrador"}
        </button>
      </div>
    </form>
  );
}
