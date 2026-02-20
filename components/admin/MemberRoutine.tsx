"use client";

import Link from "next/link";

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
  order_index: number;
  exercise: Exercise;
}

interface Routine {
  id: string;
  name: string;
  created_at: string;
  routine_exercises: RoutineExercise[];
}

interface MemberRoutineProps {
  routine: Routine | null;
  memberId: string;
  memberName: string;
}

export function MemberRoutine({
  routine,
  memberId,
  memberName,
}: MemberRoutineProps) {
  if (!routine) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          🏋️ Rutina Asignada
        </h2>

        <div className="text-center py-8">
          <span className="text-6xl mb-4 block opacity-20">🏋️</span>
          <p className="text-gray-400 mb-4">
            {memberName} aún no tiene una rutina asignada
          </p>
          <Link
            href={`/admin/routines/new?member=${memberId}`}
            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            Crear Rutina
          </Link>
        </div>
      </div>
    );
  }

  const sortedExercises = [...routine.routine_exercises].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🏋️ Rutina Asignada</h2>
        <Link
          href={`/admin/routines/${routine.id}`}
          className="text-green-400 hover:text-green-300 text-sm"
        >
          Ver completa →
        </Link>
      </div>

      <div className="mb-4">
        <h3 className="text-white font-semibold mb-1">{routine.name}</h3>
        <p className="text-gray-400 text-sm">
          Creada el {new Date(routine.created_at).toLocaleDateString("es-AR")}
        </p>
      </div>

      <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total ejercicios:</span>
          <span className="text-white font-bold">{sortedExercises.length}</span>
        </div>
      </div>

      <div className="space-y-2">
        {sortedExercises.slice(0, 5).map((routineEx, index) => (
          <div key={routineEx.id} className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {routineEx.exercise.name}
                </p>
                <p className="text-gray-400 text-xs">
                  {routineEx.exercise.muscle_group}
                </p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-300">
                  <span>{routineEx.sets} series</span>
                  <span>•</span>
                  <span>{routineEx.reps} reps</span>
                  <span>•</span>
                  <span>{routineEx.rest_seconds}s</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sortedExercises.length > 5 && (
          <div className="text-center pt-2">
            <Link
              href={`/admin/routines/${routine.id}`}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              Ver {sortedExercises.length - 5} ejercicios más →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <Link
          href={`/admin/routines/new?member=${memberId}`}
          className="block text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          🔄 Asignar Nueva Rutina
        </Link>
      </div>
    </div>
  );
}
