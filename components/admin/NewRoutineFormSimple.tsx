"use client";
// ============================================================
// ARCHIVO: components/admin/NewRoutineFormSimple.tsx
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  exercise_images?: ExerciseImage[];
}
interface RoutineExercise {
  exercise: Exercise;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  day_number: number;
  day_description?: string;
}

export function NewRoutineFormSimple({
  exercises,
}: {
  exercises: Exercise[];
  adminId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [isWeeklyRoutine, setIsWeeklyRoutine] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayDescriptions, setDayDescriptions] = useState<
    Record<number, string>
  >({ 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

  const muscleGroups = Array.from(
    new Set(exercises.map((ex) => ex.muscle_group)),
  ).sort();
  const filteredExercises = exercises.filter(
    (exercise) =>
      (selectedMuscleGroup === "all" ||
        exercise.muscle_group === selectedMuscleGroup) &&
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addExercise = (exercise: Exercise) =>
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise,
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        day_number: currentDay,
        day_description: dayDescriptions[currentDay],
      },
    ]);

  const removeExercise = (index: number) =>
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  const updateExerciseConfig = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!routineName.trim())
        throw new Error("Debes ingresar un nombre para la rutina");
      if (selectedExercises.length === 0)
        throw new Error("Debes agregar al menos un ejercicio");

      // Agrupar ejercicios por día
      const dayMap: Record<number, typeof selectedExercises> = {};
      selectedExercises.forEach((ex) => {
        if (!dayMap[ex.day_number]) dayMap[ex.day_number] = [];
        dayMap[ex.day_number].push(ex);
      });

      const days = Object.entries(dayMap).map(([dayNum, exs]) => ({
        day_number: parseInt(dayNum),
        day_name: `Día ${dayNum}`,
        description: dayDescriptions[parseInt(dayNum)] || "",
        exercises: exs.map((ex, idx) => ({
          exerciseId: ex.exercise.id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes || null,
          order_index: idx + 1,
        })),
      }));

      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: routineName, days }),
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

  const exercisesForCurrentDay = selectedExercises.filter(
    (ex) => ex.day_number === currentDay,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📋 Información de la Rutina
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              required
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Rutina Full Body - Principiante"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="weekly"
              checked={isWeeklyRoutine}
              onChange={(e) => setIsWeeklyRoutine(e.target.checked)}
              className="w-5 h-5 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="weekly" className="text-gray-300 cursor-pointer">
              Rutina Semanal (5 días diferentes)
            </label>
          </div>
        </div>
      </div>

      {isWeeklyRoutine && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Configurar Días</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setCurrentDay(day)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${currentDay === day ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Día {day}
                {selectedExercises.filter((ex) => ex.day_number === day)
                  .length > 0 && (
                  <span className="block text-xs mt-1">
                    {
                      selectedExercises.filter((ex) => ex.day_number === day)
                        .length
                    }{" "}
                    ejercicios
                  </span>
                )}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción del Día {currentDay}
            </label>
            <input
              type="text"
              value={dayDescriptions[currentDay]}
              onChange={(e) =>
                setDayDescriptions({
                  ...dayDescriptions,
                  [currentDay]: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Cuádriceps y Pantorrillas"
            />
          </div>
        </div>
      )}

      {exercisesForCurrentDay.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            ✅ Ejercicios del Día {currentDay}
            {dayDescriptions[currentDay] && ` - ${dayDescriptions[currentDay]}`}
          </h3>
          <div className="space-y-3">
            {selectedExercises.map((re, originalIndex) => {
              if (re.day_number !== currentDay) return null;
              return (
                <div
                  key={originalIndex}
                  className="bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {re.exercise.exercise_images?.[0] && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={re.exercise.exercise_images[0].image_url}
                          alt={re.exercise.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-semibold">
                            {re.exercise.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {re.exercise.muscle_group}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExercise(originalIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Series", field: "sets", type: "number" },
                          {
                            label: "Reps",
                            field: "reps",
                            type: "text",
                            placeholder: "10-12",
                          },
                          {
                            label: "Descanso (seg)",
                            field: "rest_seconds",
                            type: "number",
                          },
                        ].map(({ label, field, type, ...rest }) => (
                          <div key={field}>
                            <label className="block text-xs text-gray-400 mb-1">
                              {label}
                            </label>
                            <input
                              type={type}
                              value={(re as any)[field]}
                              onChange={(e) =>
                                updateExerciseConfig(
                                  originalIndex,
                                  field,
                                  type === "number"
                                    ? parseInt(e.target.value)
                                    : e.target.value,
                                )
                              }
                              className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                              {...rest}
                            />
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={re.notes || ""}
                        onChange={(e) =>
                          updateExerciseConfig(
                            originalIndex,
                            "notes",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        placeholder="Ej: Alta carga, técnica controlada"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          ➕ Agregar Ejercicios {isWeeklyRoutine && `al Día ${currentDay}`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los grupos</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => addExercise(exercise)}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                {exercise.exercise_images?.[0] && (
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={exercise.exercise_images[0].image_url}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {exercise.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {exercise.muscle_group}
                  </p>
                </div>
              </div>
            </button>
          ))}
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
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Rutina"}
        </button>
      </div>
    </form>
  );
}
