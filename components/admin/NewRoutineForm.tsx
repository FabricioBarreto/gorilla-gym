"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Member {
  id: string;
  full_name: string;
  dni?: string;
}
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
  exerciseId: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
}

interface NewRoutineFormProps {
  members: Member[];
  exercises: Exercise[];
  adminId: string;
  preselectedMember?: string;
}

export function NewRoutineForm({
  members,
  exercises,
  adminId,
  preselectedMember,
}: NewRoutineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [selectedMember, setSelectedMember] = useState(preselectedMember || "");
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");

  useEffect(() => {
    if (preselectedMember) setSelectedMember(preselectedMember);
  }, [preselectedMember]);

  const muscleGroups = [
    "all",
    ...Array.from(new Set(exercises.map((e) => e.muscle_group))),
  ];
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGroup =
      filterGroup === "all" || ex.muscle_group === filterGroup;
    const notSelected = !selectedExercises.find(
      (se) => se.exerciseId === ex.id,
    );
    return matchesSearch && matchesGroup && notSelected;
  });

  const addExercise = (exercise: Exercise) =>
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        notes: "",
      },
    ]);
  const removeExercise = (exerciseId: string) =>
    setSelectedExercises(
      selectedExercises.filter((e) => e.exerciseId !== exerciseId),
    );
  const updateExercise = (
    exerciseId: string,
    field: keyof RoutineExercise,
    value: any,
  ) =>
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e,
      ),
    );
  const moveExercise = (index: number, direction: "up" | "down") => {
    const newExercises = [...selectedExercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newExercises.length) return;
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];
    setSelectedExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!selectedMember) throw new Error("Debes seleccionar un alumno");
      if (selectedExercises.length === 0)
        throw new Error("Debes agregar al menos un ejercicio");
      if (!routineName.trim())
        throw new Error("Debes ingresar un nombre para la rutina");

      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routineName,
          days: [
            {
              day_number: 1,
              day_name: "Rutina completa",
              description: "",
              exercises: selectedExercises.map((ex, index) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                rest_seconds: ex.rest_seconds,
                notes: ex.notes || null,
                order_index: index + 1,
              })),
            },
          ],
          assignToUserId: selectedMember,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/admin/routines");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear la rutina");
      setLoading(false);
    }
  };

  const getExerciseById = (id: string) => exercises.find((e) => e.id === id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📋 Información de la Rutina
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alumno *
            </label>
            <select
              required
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar alumno...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} {member.dni && `(DNI: ${member.dni})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              required
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Rutina Full Body - Principiante"
            />
          </div>
        </div>
      </div>

      {selectedExercises.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            ✅ Ejercicios Agregados ({selectedExercises.length})
          </h2>
          <div className="space-y-4">
            {selectedExercises.map((routineEx, index) => {
              const exercise = getExerciseById(routineEx.exerciseId);
              if (!exercise) return null;
              return (
                <div
                  key={routineEx.exerciseId}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "up")}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "down")}
                          disabled={index === selectedExercises.length - 1}
                          className="text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-bold">
                            {exercise.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {exercise.muscle_group}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExercise(routineEx.exerciseId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            label: "Series",
                            field: "sets" as const,
                            type: "number",
                            min: 1,
                            max: 10,
                          },
                          {
                            label: "Repeticiones",
                            field: "reps" as const,
                            type: "text",
                          },
                          {
                            label: "Descanso (seg)",
                            field: "rest_seconds" as const,
                            type: "number",
                            min: 0,
                            max: 300,
                            step: 15,
                          },
                        ].map(({ label, field, type, ...rest }) => (
                          <div key={field}>
                            <label className="block text-xs text-gray-400 mb-1">
                              {label}
                            </label>
                            <input
                              type={type}
                              value={routineEx[field]}
                              onChange={(e) =>
                                updateExercise(
                                  routineEx.exerciseId,
                                  field,
                                  type === "number"
                                    ? parseInt(e.target.value)
                                    : e.target.value,
                                )
                              }
                              className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              {...rest}
                            />
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={routineEx.notes}
                        onChange={(e) =>
                          updateExercise(
                            routineEx.exerciseId,
                            "notes",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Notas para el alumno (opcional)..."
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
        <h2 className="text-xl font-bold text-white mb-4">
          ➕ Agregar Ejercicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los grupos</option>
            {muscleGroups
              .filter((g) => g !== "all")
              .map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
          </select>
        </div>
        {filteredExercises.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {searchTerm || filterGroup !== "all"
              ? "No se encontraron ejercicios"
              : "Todos los ejercicios ya fueron agregados"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => addExercise(exercise)}
                className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-3 text-left transition-colors"
              >
                {exercise.exercise_images?.[0] && (
                  <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                    <Image
                      src={exercise.exercise_images[0].image_url}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h4 className="text-white font-semibold text-sm">
                  {exercise.name}
                </h4>
                <p className="text-gray-400 text-xs">{exercise.muscle_group}</p>
              </button>
            ))}
          </div>
        )}
      </div>

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
          type="submit"
          disabled={
            loading || selectedExercises.length === 0 || !selectedMember
          }
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creando..." : "Crear y Asignar Rutina"}
        </button>
      </div>
    </form>
  );
}
