"use client";

// ============================================================
// ARCHIVO: components/user/MuscleExercisesList.tsx
// ============================================================
import { useState } from "react";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_group: string;
  instructions?: string;
  exercise_images?: {
    id: string;
    image_url: string;
    order_index: number;
  }[];
}

interface MuscleExercisesListProps {
  exercises: Exercise[];
}

export function MuscleExercisesList({ exercises }: MuscleExercisesListProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedExercise(null);
    setCurrentImageIndex(0);
  };

  // Imágenes del modal ordenadas por order_index
  const sortedImages = [...(selectedExercise?.exercise_images || [])].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < sortedImages.length - 1 ? prev + 1 : 0,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : sortedImages.length - 1,
    );
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">
          No hay ejercicios en este grupo muscular
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => {
          // Primera imagen también ordenada
          const firstImage = [...(exercise.exercise_images || [])].sort(
            (a, b) => a.order_index - b.order_index,
          )[0];

          return (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="group bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
            >
              {firstImage ? (
                <div className="aspect-video bg-gray-700 overflow-hidden">
                  <img
                    src={firstImage.image_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Sin imagen</span>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {exercise.name}
                </h3>
                {exercise.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {exercise.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    {exercise.muscle_group}
                  </span>
                  <span className="text-gray-500 group-hover:text-green-400 transition-colors text-sm">
                    Ver detalles →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalle */}
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

              {/* Carousel ordenado por order_index */}
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
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
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
    </>
  );
}
