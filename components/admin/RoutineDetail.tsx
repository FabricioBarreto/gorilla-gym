"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface ExerciseImage {
  id: string;
  image_url: string;
  order_index: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  description?: string;
  instructions?: string;
  exercise_images?: ExerciseImage[];
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
  updated_at: string;
  routine_exercises: RoutineExercise[];
}

interface Assignment {
  id: string;
  assigned_at: string;
  profile: {
    id: string;
    full_name: string;
    dni?: string;
  };
}

interface RoutineDetailProps {
  routine: Routine;
  assignments: Assignment[];
}

export function RoutineDetail({ routine, assignments }: RoutineDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [removing, setRemoving] = useState<string | null>(null);

  const sortedExercises = [...routine.routine_exercises].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("¿Estás seguro de quitar esta rutina del alumno?")) return;

    setRemoving(assignmentId);
    try {
      const { error } = await supabase
        .from("routine_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      alert("Error al quitar la asignación");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {routine.name}
            </h1>
            <p className="text-gray-400">
              Creada el{" "}
              {new Date(routine.created_at).toLocaleDateString("es-AR")}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/routines/${routine.id}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              ✏️ Editar
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total ejercicios</p>
            <p className="text-white text-2xl font-bold">
              {sortedExercises.length}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Alumnos asignados</p>
            <p className="text-white text-2xl font-bold">
              {assignments.length}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Series totales</p>
            <p className="text-white text-2xl font-bold">
              {sortedExercises.reduce((sum, ex) => sum + ex.sets, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Alumnos asignados */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            👥 Alumnos con esta rutina ({assignments.length})
          </h2>
          <Link
            href={`/admin/routines/${routine.id}/assign`}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Asignar a más alumnos →
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Esta rutina no está asignada a ningún alumno
            </p>
            <Link
              href={`/admin/routines/${routine.id}/assign`}
              className="text-green-400 hover:text-green-300"
            >
              Asignar ahora →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/admin/members/${assignment.profile.id}`}
                    className="text-white font-medium hover:text-green-400"
                  >
                    {assignment.profile.full_name}
                  </Link>
                  {assignment.profile.dni && (
                    <p className="text-gray-400 text-sm">
                      DNI: {assignment.profile.dni}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Asignada:{" "}
                    {new Date(assignment.assigned_at).toLocaleDateString(
                      "es-AR",
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  disabled={removing === assignment.id}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  title="Quitar rutina"
                >
                  {removing === assignment.id ? "..." : "✕"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ejercicios */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          🏋️ Ejercicios de la Rutina
        </h2>

        <div className="space-y-4">
          {sortedExercises.map((routineEx, index) => (
            <div
              key={routineEx.id}
              className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-5"
            >
              <div className="flex items-start gap-4">
                {/* Número */}
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>

                {/* Imagen del ejercicio */}
                {routineEx.exercise.exercise_images?.[0] && (
                  <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                    <Image
                      src={routineEx.exercise.exercise_images[0].image_url}
                      alt={routineEx.exercise.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="flex-1">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {routineEx.exercise.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {routineEx.exercise.muscle_group}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Series</p>
                      <p className="text-white font-bold text-lg">
                        {routineEx.sets}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Repeticiones</p>
                      <p className="text-white font-bold text-lg">
                        {routineEx.reps}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Descanso</p>
                      <p className="text-white font-bold text-lg">
                        {routineEx.rest_seconds}s
                      </p>
                    </div>
                  </div>

                  {/* Descripción */}
                  {routineEx.exercise.description && (
                    <p className="text-gray-300 text-sm mb-3">
                      {routineEx.exercise.description}
                    </p>
                  )}

                  {/* Notas del entrenador */}
                  {routineEx.notes && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                      <p className="text-blue-300 text-sm">
                        <span className="font-semibold">
                          💬 Nota del entrenador:
                        </span>{" "}
                        {routineEx.notes}
                      </p>
                    </div>
                  )}

                  {/* Instrucciones */}
                  {routineEx.exercise.instructions && (
                    <details className="group">
                      <summary className="cursor-pointer text-green-400 text-sm font-medium hover:text-green-300 list-none">
                        <span className="inline-flex items-center">
                          <span className="mr-2 group-open:rotate-90 transition-transform">
                            ▶
                          </span>
                          Ver instrucciones completas
                        </span>
                      </summary>
                      <div className="mt-3 pl-6">
                        <div className="text-gray-300 text-sm whitespace-pre-line">
                          {routineEx.exercise.instructions}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
