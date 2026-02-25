"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Admin {
  id: string;
  full_name: string;
  dni: string;
  created_at: string;
}

interface AdminsListProps {
  admins: Admin[];
  currentAdminId: string;
}

export function AdminsList({ admins, currentAdminId }: AdminsListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Administrador ${fullName} creado correctamente`);
      setShowForm(false);
      setFullName("");
      setDni("");
      setPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (adminId === currentAdminId) {
      setError("No podés eliminarte a vos mismo");
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar al administrador ${adminName}?`))
      return;
    setDeleteLoading(adminId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/members/${adminId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Administrador ${adminName} eliminado`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Administradores ({admins.length})
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError(null);
              setSuccess(null);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            {showForm ? "✕ Cancelar" : "+ Nuevo Admin"}
          </button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-gray-700 bg-gray-700/30">
            <h3 className="text-lg font-bold text-white mb-4">
              Crear nuevo administrador
            </h3>
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nombre Apellido"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  maxLength={8}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Repetir contraseña"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Administrador"}
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Administrador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                DNI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(admin.full_name ?? "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {admin.full_name}
                      </p>
                      {admin.id === currentAdminId && (
                        <span className="text-xs text-yellow-400">Tú</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{admin.dni}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(admin.created_at).toLocaleDateString("es-AR")}
                </td>
                <td className="px-6 py-4">
                  {admin.id !== currentAdminId ? (
                    <button
                      onClick={() => handleDelete(admin.id, admin.full_name)}
                      disabled={deleteLoading === admin.id}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      {deleteLoading === admin.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  ) : (
                    <span className="text-gray-600 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No hay administradores registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
