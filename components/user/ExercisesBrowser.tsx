"use client";

import { useState } from "react";
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
  instructions?: string;
  exercise_images?: ExerciseImage[];
}

interface ExercisesBrowserProps {
  exercises: Exercise[];
}

export function ExercisesBrowser({ exercises }: ExercisesBrowserProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener grupos musculares únicos
  const muscleGroups = Array.from(
    new Set(exercises.map((ex) => ex.muscle_group)),
  ).sort();

  // Filtrar ejercicios
  const filteredExercises = exercises.filter((exercise) => {
    const matchesGroup =
      selectedMuscleGroup === "all" ||
      exercise.muscle_group === selectedMuscleGroup;
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedExercise(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedExercise?.exercise_images) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % selectedExercise.exercise_images!.length,
      );
    }
  };

  const prevImage = () => {
    if (selectedExercise?.exercise_images) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selectedExercise.exercise_images!.length) %
          selectedExercise.exercise_images!.length,
      );
    }
  };

  const sortedImages =
    selectedExercise?.exercise_images?.sort(
      (a, b) => a.order_index - b.order_index,
    ) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Filtros */}
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

            {/* Filtro por grupo muscular */}
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos los grupos musculares</option>
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {filteredExercises.length} ejercicio
            {filteredExercises.length !== 1 ? "s" : ""} encontrado
            {filteredExercises.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Grid de ejercicios */}
        {filteredExercises.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              No se encontraron ejercicios con estos filtros
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise)}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-green-500 transition-all hover:scale-105 text-left"
              >
                {/* Imagen */}
                {exercise.exercise_images?.[0] ? (
                  <div className="relative w-full h-48 bg-gray-700">
                    <Image
                      src={exercise.exercise_images[0].image_url}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                    />
                    {exercise.exercise_images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {exercise.exercise_images.length} fotos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">🏋️</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">
                      {exercise.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      {exercise.muscle_group}
                    </span>
                  </div>

                  {exercise.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {exercise.description}
                    </p>
                  )}

                  <div className="mt-3 text-green-400 text-sm font-medium">
                    Ver detalles →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedExercise && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">
                {selectedExercise.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Grupo muscular */}
              <div>
                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                  {selectedExercise.muscle_group}
                </span>
              </div>

              {/* Descripción */}
              {selectedExercise.description && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-300">
                    {selectedExercise.description}
                  </p>
                </div>
              )}

              {/* Carrusel de imágenes */}
              {sortedImages.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    Demostración Visual
                  </h3>
                  <div className="relative bg-gray-700 rounded-lg overflow-hidden group">
                    <div className="relative w-full h-96">
                      <Image
                        src={sortedImages[currentImageIndex].image_url}
                        alt={`${selectedExercise.name} - Paso ${currentImageIndex + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {sortedImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          →
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          Paso {currentImageIndex + 1} de {sortedImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {sortedImages.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {sortedImages.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex
                              ? "border-green-500 scale-110"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <Image
                            src={img.image_url}
                            alt={`Miniatura ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instrucciones */}
              {selectedExercise.instructions && (
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    Instrucciones Paso a Paso
                  </h3>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-gray-300 whitespace-pre-line">
                      {selectedExercise.instructions}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
