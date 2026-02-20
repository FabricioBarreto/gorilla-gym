"use client";

import { useState } from "react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExerciseId: string;
  onSelect: (exerciseId: string) => void;
}

export function ExerciseSelector({
  exercises,
  selectedExerciseId,
  onSelect,
}: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");

  // Obtener grupos musculares únicos
  const muscleGroups = Array.from(
    new Set(exercises.map((e) => e.muscle_group)),
  ).sort();

  // Filtrar ejercicios
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMuscleGroup =
      selectedMuscleGroup === "all" ||
      exercise.muscle_group === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  return (
    <div className="space-y-3">
      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar ejercicio..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtro por grupo muscular */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedMuscleGroup("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedMuscleGroup === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Todos ({exercises.length})
        </button>
        {muscleGroups.map((group) => {
          const count = exercises.filter(
            (e) => e.muscle_group === group,
          ).length;
          return (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedMuscleGroup(group)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedMuscleGroup === group
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {group} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de ejercicios */}
      <div className="max-h-64 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg">
        {filteredExercises.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors ${
                  selectedExerciseId === exercise.id
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        selectedExerciseId === exercise.id
                          ? "text-white"
                          : "text-white"
                      }`}
                    >
                      {exercise.name}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        selectedExerciseId === exercise.id
                          ? "text-blue-200"
                          : "text-gray-400"
                      }`}
                    >
                      {exercise.muscle_group}
                    </p>
                  </div>
                  {selectedExerciseId === exercise.id && (
                    <span className="text-white text-xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              {searchTerm || selectedMuscleGroup !== "all"
                ? "No se encontraron ejercicios"
                : "No hay ejercicios disponibles"}
            </p>
          </div>
        )}
      </div>

      {/* Info de selección */}
      {filteredExercises.length > 0 && (
        <p className="text-gray-400 text-xs">
          Mostrando {filteredExercises.length} de {exercises.length} ejercicios
        </p>
      )}
    </div>
  );
}
