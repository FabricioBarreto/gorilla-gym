"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_group: string;
  image_url?: string;
  instructions?: string;
  created_at: string;
}

interface ExercisesListProps {
  exercises: Exercise[];
}

export function ExercisesList({ exercises }: ExercisesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");

  // Obtener grupos musculares únicos
  const muscleGroups = [
    "all",
    ...Array.from(new Set(exercises.map((e) => e.muscle_group))),
  ];

  // Filtrar ejercicios
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGroup =
      filterGroup === "all" || exercise.muscle_group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const getMuscleGroupIcon = (group: string) => {
    const icons: { [key: string]: string } = {
      Pecho: "💪",
      Espalda: "🦾",
      Piernas: "🦵",
      Hombros: "🏋️",
      Brazos: "💪",
      Abdomen: "🔥",
      Glúteos: "🍑",
      Cardio: "❤️",
    };
    return icons[group] || "🏋️";
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
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

          {/* Filtro por grupo */}
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

        <div className="mt-4 text-gray-400 text-sm">
          {filteredExercises.length} ejercicio
          {filteredExercises.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid de ejercicios */}
      {filteredExercises.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <span className="text-6xl mb-4 block">🏋️</span>
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm || filterGroup !== "all"
              ? "No se encontraron ejercicios"
              : "No hay ejercicios registrados"}
          </p>
          {!searchTerm && filterGroup === "all" && (
            <Link
              href="/admin/exercises/new"
              className="text-green-500 hover:text-green-400 inline-block mt-2"
            >
              Crear el primer ejercicio →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/admin/exercises/${exercise.id}`}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-green-500 transition-colors group"
            >
              {/* Imagen */}
              <div className="relative h-48 bg-gray-700 overflow-hidden">
                {exercise.image_url ? (
                  <Image
                    src={exercise.image_url}
                    alt={exercise.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-6xl opacity-20">
                      {getMuscleGroupIcon(exercise.muscle_group)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                    {exercise.name}
                  </h3>
                  <span className="text-2xl">
                    {getMuscleGroupIcon(exercise.muscle_group)}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  {exercise.muscle_group}
                </p>

                {exercise.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {exercise.description}
                  </p>
                )}

                {exercise.instructions && (
                  <div className="mt-3 flex items-center text-xs text-green-400">
                    <span className="mr-1">📋</span>
                    <span>Con instrucciones</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
