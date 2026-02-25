"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseSelector } from "./ExerciseSelector";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}
interface DayExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}
interface RoutineDay {
  day_number: number;
  day_name: string;
  description: string;
  exercises: DayExercise[];
}

interface NewRoutineFormByDaysProps {
  exercises: Exercise[];
  adminId: string;
}

export function NewRoutineFormByDays({ exercises }: NewRoutineFormByDaysProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"hombres" | "mujeres" | "">("");
  const [days, setDays] = useState<RoutineDay[]>([
    { day_number: 1, day_name: "", description: "", exercises: [] },
  ]);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleDay = (idx: number) =>
    setExpandedDays((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const addDay = () => {
    const newIdx = days.length;
    setDays([
      ...days,
      {
        day_number: days.length + 1,
        day_name: "",
        description: "",
        exercises: [],
      },
    ]);
    setExpandedDays((prev) => ({ ...prev, [newIdx]: true }));
  };

  const removeDay = (dayIndex: number) => {
    const updated = days.filter((_, i) => i !== dayIndex);
    updated.forEach((day, i) => (day.day_number = i + 1));
    setDays(updated);
    const newExpanded: Record<number, boolean> = {};
    Object.keys(expandedDays).forEach((key) => {
      const idx = parseInt(key);
      if (idx < dayIndex) newExpanded[idx] = expandedDays[idx];
      else if (idx > dayIndex) newExpanded[idx - 1] = expandedDays[idx];
    });
    setExpandedDays(newExpanded);
  };

  const updateDay = (dayIndex: number, field: keyof RoutineDay, value: any) => {
    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setDays(updated);
  };

  const addExerciseToDay = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].exercises.push({
      exerciseId: "",
      sets: 3,
      reps: "10",
      rest_seconds: 60,
      notes: "",
      order_index: updated[dayIndex].exercises.length + 1,
    });
    setDays(updated);
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    const updated = [...days];
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter(
      (_, i) => i !== exerciseIndex,
    );
    updated[dayIndex].exercises.forEach((ex, i) => (ex.order_index = i + 1));
    setDays(updated);
  };

  const updateDayExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: keyof DayExercise,
    value: any,
  ) => {
    const updated = [...days];
    updated[dayIndex].exercises[exerciseIndex] = {
      ...updated[dayIndex].exercises[exerciseIndex],
      [field]: value,
    };
    setDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!name.trim()) throw new Error("El nombre de la rutina es requerido");
      if (!category) throw new Error("Debes seleccionar una categoría");
      if (days.length === 0) throw new Error("Debes agregar al menos un día");
      for (const day of days) {
        if (!day.day_name.trim())
          throw new Error(`El Día ${day.day_number} necesita un nombre`);
        if (day.exercises.length === 0)
          throw new Error(
            `El Día ${day.day_number} necesita al menos un ejercicio`,
          );
        if (day.exercises.some((ex) => !ex.exerciseId))
          throw new Error(
            `Todos los ejercicios del Día ${day.day_number} deben estar seleccionados`,
          );
      }

      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category,
          days,
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
          Información Básica
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
              placeholder="Ej: Gorilla Gym - Semana 2"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Rutina de hipertrofia avanzada..."
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Días de Entrenamiento
          </h2>
          <button
            type="button"
            onClick={addDay}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Agregar Día</span>
          </button>
        </div>

        {days.map((day, dayIndex) => {
          const isExpanded = expandedDays[dayIndex] || false;
          const exerciseCount = day.exercises.length;
          const hasName = day.day_name.trim() !== "";
          return (
            <div
              key={dayIndex}
              className="bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 hover:bg-gray-700/50 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleDay(dayIndex)}
                  className="flex-1 flex items-center space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {day.day_number}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-white">
                        {hasName ? day.day_name : `Día ${day.day_number}`}
                      </h3>
                      {!hasName && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Sin nombre
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {exerciseCount} ejercicio{exerciseCount !== 1 ? "s" : ""}
                      {exerciseCount === 0 && " - Click para agregar"}
                    </p>
                  </div>
                </button>
                <div className="flex items-center space-x-3">
                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar Día ${day.day_number}?`))
                          removeDay(dayIndex);
                      }}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleDay(dayIndex)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span
                      className={`text-2xl transition-transform inline-block ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 pt-0 border-t border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Nombre del Día *
                      </label>
                      <input
                        type="text"
                        value={day.day_name}
                        onChange={(e) =>
                          updateDay(dayIndex, "day_name", e.target.value)
                        }
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Cuádriceps y Pantorrillas"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={day.description}
                        onChange={(e) =>
                          updateDay(dayIndex, "description", e.target.value)
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enfoque en fuerza..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-gray-300 text-sm font-medium">
                          Ejercicios ({exerciseCount})
                        </label>
                        <button
                          type="button"
                          onClick={() => addExerciseToDay(dayIndex)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-1"
                        >
                          <span>➕</span>
                          <span>Agregar Ejercicio</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <div
                            key={exerciseIndex}
                            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {exercise.order_index}
                                </span>
                                {exercise.exerciseId && (
                                  <span className="text-white text-sm font-medium">
                                    {
                                      exercises.find(
                                        (e) => e.id === exercise.exerciseId,
                                      )?.name
                                    }
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeExerciseFromDay(dayIndex, exerciseIndex)
                                }
                                className="text-red-400 hover:text-red-300 text-sm flex-shrink-0"
                              >
                                🗑️
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <ExerciseSelector
                                exercises={exercises}
                                selectedExerciseId={exercise.exerciseId}
                                onSelect={(exerciseId) =>
                                  updateDayExercise(
                                    dayIndex,
                                    exerciseIndex,
                                    "exerciseId",
                                    exerciseId,
                                  )
                                }
                              />
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  {
                                    label: "Series",
                                    field: "sets" as const,
                                    type: "number",
                                    min: 1,
                                  },
                                  {
                                    label: "Reps",
                                    field: "reps" as const,
                                    type: "text",
                                    placeholder: "10",
                                  },
                                  {
                                    label: "Desc(s)",
                                    field: "rest_seconds" as const,
                                    type: "number",
                                    min: 0,
                                  },
                                ].map(
                                  ({
                                    label,
                                    field,
                                    type,
                                    min,
                                    placeholder,
                                  }) => (
                                    <div key={field}>
                                      <label className="block text-gray-400 text-xs mb-1">
                                        {label}
                                      </label>
                                      <input
                                        type={type}
                                        min={min}
                                        value={exercise[field]}
                                        placeholder={placeholder}
                                        onChange={(e) =>
                                          updateDayExercise(
                                            dayIndex,
                                            exerciseIndex,
                                            field,
                                            type === "number"
                                              ? parseInt(e.target.value) || 0
                                              : e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                              <div>
                                <label className="block text-gray-400 text-xs mb-1">
                                  Notas
                                </label>
                                <input
                                  type="text"
                                  value={exercise.notes}
                                  placeholder="Fuerza (alta carga)"
                                  onChange={(e) =>
                                    updateDayExercise(
                                      dayIndex,
                                      exerciseIndex,
                                      "notes",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {day.exercises.length === 0 && (
                          <div className="text-center py-8 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
                            <p className="text-gray-400 text-sm mb-3">
                              No hay ejercicios en este día
                            </p>
                            <button
                              type="button"
                              onClick={() => addExerciseToDay(dayIndex)}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              ➕ Agregar primer ejercicio
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Creando..." : "Crear Rutina"}
        </button>
      </div>
    </form>
  );
}
