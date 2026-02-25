"use client";

import { useState } from "react";
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
  id?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description || "");
  const [category, setCategory] = useState<"hombres" | "mujeres" | "">(
    (routine.category as "hombres" | "mujeres") || "",
  );
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
      if (!name.trim()) throw new Error("El nombre de la rutina es requerido");
      if (!category) throw new Error("Debes seleccionar una categoría");
      if (selectedExercises.length === 0)
        throw new Error("Debes agregar al menos un ejercicio");
      if (selectedExercises.some((ex) => !ex.exerciseId))
        throw new Error("Todos los ejercicios deben estar seleccionados");

      // Reutilizamos la API de routines/[id] con días simulados (1 solo día)
      const res = await fetch(`/api/routines/${routine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category,
          days: [
            {
              day_number: 1,
              day_name: "Rutina completa",
              description: "",
              exercises: selectedExercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                rest_seconds: ex.rest_seconds,
                notes: ex.notes || null,
                order_index: ex.order_index,
              })),
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Categoría *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(["hombres", "mujeres"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-lg border-2 transition-all ${category === cat ? (cat === "hombres" ? "border-blue-500 bg-blue-500/10" : "border-pink-500 bg-pink-500/10") : "border-gray-600 bg-gray-700/50 hover:border-gray-500"}`}
                >
                  <div className="text-4xl mb-2">
                    {cat === "hombres" ? "💪" : "🏋️‍♀️"}
                  </div>
                  <p className="text-white font-medium capitalize">{cat}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                {[
                  { label: "Series", field: "sets" as const, type: "number" },
                  {
                    label: "Repeticiones",
                    field: "reps" as const,
                    type: "text",
                  },
                  {
                    label: "Descanso (seg)",
                    field: "rest_seconds" as const,
                    type: "number",
                  },
                  { label: "Notas", field: "notes" as const, type: "text" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-gray-300 text-sm mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={exercise[field]}
                      onChange={(e) =>
                        updateExercise(
                          index,
                          field,
                          type === "number"
                            ? parseInt(e.target.value) || 0
                            : e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
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
