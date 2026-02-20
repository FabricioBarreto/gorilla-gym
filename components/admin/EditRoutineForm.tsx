"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface RoutineExercise {
  id: string;
  exercise_id: string;
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
  description?: string;
  category?: string;
  routine_exercises: RoutineExercise[];
}

interface SelectedExercise {
  id?: string; // ID del routine_exercise (si ya existe)
  exerciseId: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

interface EditRoutineFormProps {
  routine: Routine;
  allExercises: Exercise[];
}

export function EditRoutineForm({
  routine,
  allExercises,
}: EditRoutineFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description || "");
  const [category, setCategory] = useState<"hombres" | "mujeres" | "">(
    (routine.category as "hombres" | "mujeres") || "",
  );

  // Convertir routine_exercises a formato editable
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >(
    routine.routine_exercises
      .sort((a, b) => a.order_index - b.order_index)
      .map((re) => ({
        id: re.id,
        exerciseId: re.exercise_id,
        sets: re.sets,
        reps: re.reps,
        rest_seconds: re.rest_seconds,
        notes: re.notes || "",
        order_index: re.order_index,
      })),
  );

  const addExercise = () => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: "",
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        notes: "",
        order_index: selectedExercises.length + 1,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    updated.forEach((ex, i) => (ex.order_index = i + 1));
    setSelectedExercises(updated);
  };

  const updateExercise = (
    index: number,
    field: keyof SelectedExercise,
    value: any,
  ) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name.trim()) {
        throw new Error("El nombre de la rutina es requerido");
      }

      if (!category) {
        throw new Error("Debes seleccionar una categoría");
      }

      if (selectedExercises.length === 0) {
        throw new Error("Debes agregar al menos un ejercicio");
      }

      const hasEmptyExercise = selectedExercises.some((ex) => !ex.exerciseId);
      if (hasEmptyExercise) {
        throw new Error("Todos los ejercicios deben estar seleccionados");
      }

      // Actualizar rutina
      const { error: routineError } = await supabase
        .from("routines")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          category: category,
        })
        .eq("id", routine.id);

      if (routineError) throw routineError;

      // Eliminar ejercicios antiguos
      const { error: deleteError } = await supabase
        .from("routine_exercises")
        .delete()
        .eq("routine_id", routine.id);

      if (deleteError) throw deleteError;

      // Insertar ejercicios actualizados
      const routineExercises = selectedExercises.map((ex) => ({
        routine_id: routine.id,
        exercise_id: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes || null,
        order_index: ex.order_index,
      }));

      const { error: exercisesError } = await supabase
        .from("routine_exercises")
        .insert(routineExercises);

      if (exercisesError) throw exercisesError;

      router.push("/admin/routines");
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

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Información de la Rutina
        </h2>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Categoría *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategory("hombres")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  category === "hombres"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <div className="text-4xl mb-2">💪</div>
                <p className="text-white font-medium">Hombres</p>
              </button>

              <button
                type="button"
                onClick={() => setCategory("mujeres")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  category === "mujeres"
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <div className="text-4xl mb-2">🏋️‍♀️</div>
                <p className="text-white font-medium">Mujeres</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ejercicios */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Ejercicios</h2>
          <button
            type="button"
            onClick={addExercise}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            ➕ Agregar Ejercicio
          </button>
        </div>

        <div className="space-y-4">
          {selectedExercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-white font-bold">
                  #{exercise.order_index}
                </span>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  🗑️
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ejercicio */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-2">
                    Ejercicio
                  </label>
                  <select
                    value={exercise.exerciseId}
                    onChange={(e) =>
                      updateExercise(index, "exerciseId", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar ejercicio...</option>
                    {allExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.muscle_group})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Series */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) =>
                      updateExercise(index, "sets", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Repeticiones */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Repeticiones
                  </label>
                  <input
                    type="text"
                    value={exercise.reps}
                    onChange={(e) =>
                      updateExercise(index, "reps", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Descanso */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Descanso (seg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={exercise.rest_seconds}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "rest_seconds",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Notas
                  </label>
                  <input
                    type="text"
                    value={exercise.notes}
                    onChange={(e) =>
                      updateExercise(index, "notes", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {selectedExercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No hay ejercicios agregados</p>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
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
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
