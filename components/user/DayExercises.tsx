"use client";

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

interface RoutineExercise {
  id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  exercise: Exercise;
}

interface DayExercisesProps {
  exercises: RoutineExercise[];
}

export function DayExercises({ exercises }: DayExercisesProps) {
  const [selectedExercise, setSelectedExercise] =
    useState<RoutineExercise | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sortedExercises = [...exercises].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const handleExerciseClick = (exercise: RoutineExercise) => {
    setSelectedExercise(exercise);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedExercise(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedExercise?.exercise.exercise_images) {
      setCurrentImageIndex((prev) =>
        prev < selectedExercise.exercise.exercise_images!.length - 1
          ? prev + 1
          : 0,
      );
    }
  };

  const prevImage = () => {
    if (selectedExercise?.exercise.exercise_images) {
      setCurrentImageIndex((prev) =>
        prev > 0
          ? prev - 1
          : selectedExercise.exercise.exercise_images!.length - 1,
      );
    }
  };

  if (sortedExercises.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏋️</div>
        <p className="text-gray-400 text-lg">No hay ejercicios para este día</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedExercises.map((routineExercise, index) => {
          const exercise = routineExercise.exercise;
          const firstImage = exercise.exercise_images?.[0];

          return (
            <div
              key={routineExercise.id}
              onClick={() => handleExerciseClick(routineExercise)}
              className="bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                {/* Número */}
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">
                    {index + 1}
                  </span>
                </div>

                {/* Imagen preview — oculta en mobile si no hay espacio */}
                {firstImage && (
                  <div className="hidden sm:block flex-shrink-0 w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={firstImage.image_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white leading-tight truncate">
                    {exercise.name}
                  </h3>
                  <p className="text-green-400 text-sm mb-3">
                    {exercise.muscle_group}
                  </p>

                  {/* Stats: en mobile van en grid 3 col, en desktop en fila */}
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
                    <div className="bg-gray-700/50 px-2 py-1 rounded text-center sm:text-left">
                      <span className="text-gray-400 text-xs block sm:inline">
                        Series
                      </span>
                      <span className="text-white font-bold text-sm sm:ml-1">
                        {routineExercise.sets}
                      </span>
                    </div>
                    <div className="bg-gray-700/50 px-2 py-1 rounded text-center sm:text-left">
                      <span className="text-gray-400 text-xs block sm:inline">
                        Reps
                      </span>
                      <span className="text-white font-bold text-sm sm:ml-1">
                        {routineExercise.reps}
                      </span>
                    </div>
                    <div className="bg-gray-700/50 px-2 py-1 rounded text-center sm:text-left">
                      <span className="text-gray-400 text-xs block sm:inline">
                        Desc.
                      </span>
                      <span className="text-white font-bold text-sm sm:ml-1">
                        {routineExercise.rest_seconds}s
                      </span>
                    </div>
                  </div>

                  {routineExercise.notes && (
                    <p className="text-gray-400 text-sm mt-3 italic">
                      💡 {routineExercise.notes}
                    </p>
                  )}
                </div>

                {/* Flecha */}
                <div className="flex-shrink-0 text-gray-500 text-xl self-center">
                  →
                </div>
              </div>

              {/* Imagen en mobile debajo del contenido */}
              {firstImage && (
                <div className="sm:hidden mt-3 w-full h-40 bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={firstImage.image_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
            className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {selectedExercise.exercise.name}
                  </h2>
                  <p className="text-green-400">
                    {selectedExercise.exercise.muscle_group}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl ml-4 flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {selectedExercise.exercise.exercise_images &&
                selectedExercise.exercise.exercise_images.length > 0 && (
                  <div className="mb-6">
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={
                          selectedExercise.exercise.exercise_images[
                            currentImageIndex
                          ].image_url
                        }
                        alt={`${selectedExercise.exercise.name} - paso ${currentImageIndex + 1}`}
                        className="w-full h-64 sm:h-96 object-contain"
                      />

                      {selectedExercise.exercise.exercise_images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center"
                          >
                            ←
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center"
                          >
                            →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-green-400 font-bold mb-3">
                  📊 Configuración
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Series</p>
                    <p className="text-white text-xl font-bold">
                      {selectedExercise.sets}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Repeticiones</p>
                    <p className="text-white text-xl font-bold">
                      {selectedExercise.reps}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Descanso</p>
                    <p className="text-white text-xl font-bold">
                      {selectedExercise.rest_seconds}s
                    </p>
                  </div>
                </div>
              </div>

              {selectedExercise.exercise.instructions && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">
                    📋 Instrucciones
                  </h3>
                  <p className="text-gray-300 whitespace-pre-line">
                    {selectedExercise.exercise.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
