"use client";

// ============================================================
// ARCHIVO: components/user/UserExercisesLibrary.tsx
// ============================================================
import { useState } from "react";
import Link from "next/link";

interface ExerciseImage {
  id: string;
  image_url: string;
  order_index: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  image_url?: string;
  description?: string;
  instructions?: string;
  exercise_images?: ExerciseImage[];
}

interface UserExercisesLibraryProps {
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
};

export function UserExercisesLibrary({
  exercises,
  muscleGroups,
}: UserExercisesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [viewMode, setViewMode] = useState<"groups" | "exercises">("groups");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || e.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const groupedExercises = muscleGroups.map((group) => ({
    name: group,
    count: exercises.filter((e) => e.muscle_group === group).length,
  }));

  const openModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedExercise(null);
    setCurrentImageIndex(0);
  };

  const sortedImages = [...(selectedExercise?.exercise_images || [])].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const nextImage = () =>
    setCurrentImageIndex((p) => (p < sortedImages.length - 1 ? p + 1 : 0));
  const prevImage = () =>
    setCurrentImageIndex((p) => (p > 0 ? p - 1 : sortedImages.length - 1));

  return (
    <div className="space-y-6">
      {/* Buscador y filtros */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 0) setViewMode("exercises");
                else if (selectedGroup === "all") setViewMode("groups");
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
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

        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-400 text-sm">
            {searchTerm || selectedGroup !== "all"
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
              className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "groups" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Grupos
            </button>
            <button
              onClick={() => setViewMode("exercises")}
              className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "exercises" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Ejercicios
            </button>
          </div>
        </div>
      </div>

      {/* Vista de grupos */}
      {viewMode === "groups" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groupedExercises.map((group) => (
            <Link
              key={group.name}
              href={`/dashboard/exercises/${encodeURIComponent(group.name)}`}
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
                  <div className="w-full h-full bg-gray-700 rounded-lg" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">
                {group.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {group.count} ejercicio{group.count !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Vista de ejercicios — abre modal directamente */}
      {viewMode === "exercises" && (
        <>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
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
              {filteredExercises.map((exercise) => {
                const firstImage = [...(exercise.exercise_images || [])].sort(
                  (a, b) => a.order_index - b.order_index,
                )[0];
                return (
                  <button
                    key={exercise.id}
                    onClick={() => openModal(exercise)}
                    className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg overflow-hidden transition-all hover:scale-105 group flex items-center p-4 space-x-4 text-left w-full"
                  >
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage.image_url}
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
                        <div className="w-full h-full bg-gray-600 rounded" />
                      )}
                    </div>
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
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedExercise && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedExercise.name}
                  </h2>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    {selectedExercise.muscle_group}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {sortedImages.length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={sortedImages[currentImageIndex].image_url}
                      alt={`${selectedExercise.name} - paso ${currentImageIndex + 1}`}
                      className="w-full h-96 object-contain"
                    />
                    {sortedImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {sortedImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? "bg-green-500" : "bg-gray-500"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedExercise.description && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">Descripción</h3>
                  <p className="text-gray-300">
                    {selectedExercise.description}
                  </p>
                </div>
              )}

              {selectedExercise.instructions && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">Instrucciones</h3>
                  <p className="text-gray-300 whitespace-pre-line">
                    {selectedExercise.instructions}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm text-center">
                  Consulta con tu entrenador si tienes dudas sobre la técnica
                  correcta
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
