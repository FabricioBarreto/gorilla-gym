"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Routine {
  id: string;
  name: string;
}

interface AssignRoutineButtonProps {
  memberId: string;
  currentRoutine?: { id: string; name: string } | null;
  availableRoutines: Routine[];
}

export function AssignRoutineButton({
  memberId,
  currentRoutine,
  availableRoutines,
}: AssignRoutineButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedRoutineId) {
      setError("Selecciona una rutina");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/routine-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: selectedRoutineId,
          userId: memberId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!currentRoutine) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/routine-assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: currentRoutine.id,
          userId: memberId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">🏋️ Rutina Asignada</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            {currentRoutine ? "🔄 Cambiar" : "➕ Asignar"}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {currentRoutine ? (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Rutina actual</p>
              <p className="text-white text-lg font-bold">
                {currentRoutine.name}
              </p>
            </div>
            <button
              onClick={handleUnassign}
              disabled={loading}
              className="w-full px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600/10 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Eliminando..." : "🗑️ Quitar rutina"}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 text-6xl">🏋️</div>
            <p className="text-gray-400 mb-4">
              Este alumno no tiene rutina asignada
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Asignar rutina →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Asignar Rutina</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {availableRoutines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    No hay rutinas disponibles
                  </p>
                  <p className="text-gray-500 text-sm">
                    Crea una rutina primero
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableRoutines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={() => setSelectedRoutineId(routine.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedRoutineId === routine.id
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedRoutineId === routine.id
                              ? "border-green-500 bg-green-500"
                              : "border-gray-500"
                          }`}
                        >
                          {selectedRoutineId === routine.id && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </span>
                        <p className="text-white font-medium">{routine.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssign}
                  disabled={loading || !selectedRoutineId}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? "Asignando..." : "Asignar Rutina"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
