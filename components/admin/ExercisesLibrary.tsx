"use client";

// ============================================================
// ARCHIVO: components/admin/ExercisesLibrary.tsx
// ============================================================
import { useState } from "react";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  image_url?: string;
}

interface ExercisesLibraryProps {
  exercises: Exercise[];
  muscleGroups: string[];
}

const muscleImages: Record<string, string> = {
  Bíceps: "/muscles/biceps.png",
  Cuádriceps: "/muscles/cuadriceps.png",
  Espalda: "/muscles/espalda.png",
  Glúteos: "/muscles/gluteos.png",
  Hombros: "/muscles/hombros.png",
  Isquiotibiales: "/muscles/isquiotibiales.png",
  Pecho: "/muscles/pecho.png",
  Tríceps: "/muscles/triceps.png",
  Piernas: "/muscles/piernas.png",
  Brazos: "/muscles/brazos.png",
  Abdomen: "/muscles/abdomen.png",
  Pantorrillas: "/muscles/pantorrillas.png",
  Antebrazos: "/muscles/antebrazos.png",
  Core: "/muscles/core.png",
};

export function ExercisesLibrary({
  exercises,
  muscleGroups,
}: ExercisesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [viewMode, setViewMode] = useState<"groups" | "exercises">("groups");

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || e.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Agrupar ejercicios por grupo muscular para vista de grupos
  const groupedExercises = muscleGroups.map((group) => ({
    name: group,
    count: exercises.filter((e) => e.muscle_group === group).length,
  }));

  const isSearching = searchTerm.length > 0;

  return (
    <div className="space-y-6">
      {/* Buscador y filtros */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscador */}
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 0) setViewMode("exercises");
                else setViewMode("groups");
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filtro por grupo */}
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setViewMode("exercises");
              if (e.target.value === "all" && !searchTerm)
                setViewMode("groups");
            }}
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

        {/* Toggle vista */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-400 text-sm">
            {isSearching || selectedGroup !== "all"
              ? `${filteredExercises.length} resultado${filteredExercises.length !== 1 ? "s" : ""}`
              : `${exercises.length} ejercicios · ${muscleGroups.length} grupos`}
          </p>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode("groups");
                setSearchTerm("");
                setSelectedGroup("all");
              }}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "groups"
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📂 Grupos
            </button>
            <button
              onClick={() => setViewMode("exercises")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "exercises"
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📋 Ejercicios
            </button>
          </div>
        </div>
      </div>

      {/* Vista de grupos musculares */}
      {viewMode === "groups" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groupedExercises.map((group) => (
            <button
              key={group.name}
              onClick={() => {
                setSelectedGroup(group.name);
                setViewMode("exercises");
              }}
              className="group aspect-square bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105"
            >
              <div className="w-24 h-24 mb-3 group-hover:scale-110 transition-transform">
                {muscleImages[group.name] ? (
                  <img
                    src={muscleImages[group.name]}
                    alt={group.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-6xl">🏋️</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">
                {group.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {group.count} ejercicio{group.count !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Vista de ejercicios individuales */}
      {viewMode === "exercises" && (
        <>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-400 text-lg">
                No se encontraron ejercicios
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGroup("all");
                  setViewMode("groups");
                }}
                className="mt-4 text-green-400 hover:text-green-300 text-sm"
              >
                ← Volver a grupos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/admin/exercises/${exercise.id}`}
                  className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg overflow-hidden transition-all hover:scale-105 group flex items-center p-4 space-x-4"
                >
                  {/* Imagen o placeholder */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                    {exercise.image_url ? (
                      <img
                        src={exercise.image_url}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : muscleImages[exercise.muscle_group] ? (
                      <img
                        src={muscleImages[exercise.muscle_group]}
                        alt={exercise.muscle_group}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl">🏋️</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold group-hover:text-green-400 transition-colors truncate">
                      {exercise.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                      {exercise.muscle_group}
                    </span>
                  </div>

                  <span className="text-gray-500 group-hover:text-green-400 transition-colors">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
