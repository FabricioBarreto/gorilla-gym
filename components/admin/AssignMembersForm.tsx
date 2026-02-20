"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  full_name: string;
  dni?: string;
}

interface AssignMembersFormProps {
  routineId: string;
  routineName: string;
  members: Member[];
  assignedUserIds: string[];
  adminId: string;
}

export function AssignMembersForm({
  routineId,
  routineName,
  members,
  assignedUserIds,
  adminId,
}: AssignMembersFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) {
      setError("Selecciona al menos un alumno");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const assignments = selected.map((memberId) => ({
        routine_id: routineId,
        user_id: memberId,
        assigned_by: adminId,
      }));
      const { error: insertError } = await supabase
        .from("routine_assignments")
        .insert(assignments);
      if (insertError) throw insertError;
      setSuccess(true);
      router.refresh();
      setTimeout(() => router.push(`/admin/routines/${routineId}`), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const available = members.filter((m) => !assignedUserIds.includes(m.id));
  const alreadyAssigned = members.filter((m) => assignedUserIds.includes(m.id));

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400">
            Rutina asignada correctamente. Redirigiendo...
          </p>
        </div>
      )}
      {alreadyAssigned.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Ya tienen esta rutina ({alreadyAssigned.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alreadyAssigned.map((m) => (
              <div
                key={m.id}
                className="bg-gray-700/50 rounded-lg p-3 opacity-60"
              >
                <p className="text-white font-medium text-sm">{m.full_name}</p>
                {m.dni && <p className="text-gray-400 text-xs">DNI: {m.dni}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Selecciona alumnos ({selected.length} seleccionados)
        </h2>
        {available.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Todos los alumnos ya tienen esta rutina asignada
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.map((member) => (
              <button
                key={member.id}
                onClick={() => toggle(member.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selected.includes(member.id)
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 bg-gray-700 hover:border-gray-500"
                }`}
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
                  {selected.includes(member.id) && (
                    <span className="text-green-400 text-lg">OK</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleAssign}
          disabled={loading || selected.length === 0 || available.length === 0}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading
            ? "Asignando..."
            : `Asignar a ${selected.length} alumno${selected.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
