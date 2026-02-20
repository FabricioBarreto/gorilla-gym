"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DeleteUserButtonProps {
  memberId: string;
  memberName: string;
}

export function DeleteUserButton({
  memberId,
  memberName,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteUser = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Eliminar asignaciones de rutinas
      await supabase
        .from("routine_assignments")
        .delete()
        .eq("user_id", memberId);

      // 2. Eliminar pagos
      await supabase.from("payments").delete().eq("user_id", memberId);

      // 3. Eliminar membresías
      await supabase.from("memberships").delete().eq("user_id", memberId);

      // 4. Eliminar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", memberId);

      if (profileError) throw profileError;

      // 5. Eliminar usuario de auth (intentar, pero continuar si falla)
      const { error: authError } =
        await supabase.auth.admin.deleteUser(memberId);

      if (authError) {
        console.error("Error eliminando usuario de auth:", authError);
      }

      // Redirigir a la lista de miembros
      router.push("/admin/members");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-red-400 font-bold mb-2">⚠️ Zona de Peligro</h3>
      <p className="text-gray-400 text-sm mb-4">
        Eliminar el usuario borrará permanentemente toda su información:
        membresías, pagos, rutinas asignadas y su cuenta. Esta acción no se
        puede deshacer.
      </p>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/40 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          🗑️ Eliminar Usuario
        </button>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 font-bold mb-3">
            ¿Estás seguro que deseas eliminar a {memberName}?
          </p>
          <p className="text-red-200 text-sm mb-4">
            Esta acción eliminará TODA la información del usuario y NO se puede
            deshacer.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 font-bold"
            >
              {loading ? "Eliminando..." : "SÍ, ELIMINAR PERMANENTEMENTE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
