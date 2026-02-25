"use client";
// ============================================================
// ARCHIVO: components/admin/ExistingRoutinesList.tsx
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  full_name: string;
  dni?: string;
}
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}
interface RoutineExercise {
  id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  exercise: Exercise;
}
interface Routine {
  id: string;
  name: string;
  created_at: string;
  routine_exercises: RoutineExercise[];
}

interface ExistingRoutinesListProps {
  routines: Routine[];
  members: Member[];
  adminId: string;
  preselectedMember?: string;
}

export function ExistingRoutinesList({
  routines,
  members,
  preselectedMember,
}: ExistingRoutinesListProps) {
  const router = useRouter();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    preselectedMember ? [preselectedMember] : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutines = routines.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const toggleMember = (id: string) =>
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleAssign = async () => {
    if (!selectedRoutine) {
      setError("Debes seleccionar una rutina");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Debes seleccionar al menos un alumno");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedMembers.map((memberId) =>
          fetch("/api/routine-assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              routineId: selectedRoutine,
              userId: memberId,
            }),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
          }),
        ),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      if (succeeded === 0)
        throw new Error(
          "Todos los alumnos seleccionados ya tienen esta rutina asignada",
        );
      router.push("/admin/routines");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al asignar la rutina");
      setLoading(false);
    }
  };

  const selectedRoutineData = routines.find((r) => r.id === selectedRoutine);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          ℹ️ Selecciona una rutina existente y los alumnos a los que quieres
          asignarla.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          👥 Asignar a: ({selectedMembers.length} seleccionado
          {selectedMembers.length !== 1 ? "s" : ""})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleMember(member.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${selectedMembers.includes(member.id) ? "border-green-500 bg-green-500/10" : "border-gray-600 bg-gray-700 hover:border-gray-500"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">
                    {member.full_name}
                  </p>
                  {member.dni && (
                    <p className="text-gray-400 text-xs">DNI: {member.dni}</p>
                  )}
                </div>
                {selectedMembers.includes(member.id) && (
                  <span className="text-green-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
        {selectedMembers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setSelectedMembers([])}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Deseleccionar todos
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar rutina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📋 Rutinas Disponibles ({filteredRoutines.length})
        </h2>
        {filteredRoutines.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {searchTerm
              ? "No se encontraron rutinas"
              : "No hay rutinas creadas"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredRoutines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => setSelectedRoutine(routine.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${selectedRoutine === routine.id ? "border-green-500 bg-green-500/10" : "border-gray-600 bg-gray-700 hover:border-gray-500"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold">{routine.name}</h3>
                  {selectedRoutine === routine.id && (
                    <span className="text-green-400">✓</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {routine.routine_exercises.length} ejercicio
                    {routine.routine_exercises.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(routine.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedRoutineData && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            👁️ Vista Previa: {selectedRoutineData.name}
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedRoutineData.routine_exercises
              .sort((a, b) => a.order_index - b.order_index)
              .map((ex, index) => (
                <div
                  key={ex.id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {ex.exercise.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {ex.exercise.muscle_group}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-300">
                      <span>{ex.sets} series</span>
                      <span>•</span>
                      <span>{ex.reps} reps</span>
                      <span>•</span>
                      <span>{ex.rest_seconds}s descanso</span>
                    </div>
                    {ex.notes && (
                      <p className="text-gray-400 text-xs mt-1">
                        💬 {ex.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end space-x-4 bg-gray-800 border border-gray-700 rounded-lg p-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleAssign}
          disabled={loading || !selectedRoutine || selectedMembers.length === 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Asignando..."
            : `Asignar a ${selectedMembers.length} alumno${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
