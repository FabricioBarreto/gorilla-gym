"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DeleteRoutineButtonProps {
  routineId: string;
  routineName: string;
}

export function DeleteRoutineButton({
  routineId,
  routineName,
}: DeleteRoutineButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si la rutina está asignada a algún usuario
      const { data: assignments } = await supabase
        .from("routine_assignments")
        .select("id")
        .eq("routine_id", routineId)
        .limit(1);

      if (assignments && assignments.length > 0) {
        throw new Error(
          "Esta rutina está asignada a uno o más usuarios. Primero debes desasignarla.",
        );
      }

      // Eliminar ejercicios de la rutina (CASCADE debería hacerlo automático)
      const { error: exercisesError } = await supabase
        .from("routine_exercises")
        .delete()
        .eq("routine_id", routineId);

      if (exercisesError) throw exercisesError;

      // Eliminar rutina
      const { error: routineError } = await supabase
        .from("routines")
        .delete()
        .eq("id", routineId);

      if (routineError) throw routineError;

      router.push("/admin/routines");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-red-400 font-bold text-lg mb-2">
              ⚠️ Zona de Peligro
            </h3>
            <p className="text-gray-300 text-sm mb-1">
              Eliminar esta rutina borrará permanentemente todos sus ejercicios.
            </p>
            <p className="text-gray-400 text-xs">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors font-medium"
          >
            Eliminar Rutina
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              ⚠️ Confirmar Eliminación
            </h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro que deseas eliminar la rutina{" "}
              <strong>"{routineName}"</strong>? Esta acción no se puede
              deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
