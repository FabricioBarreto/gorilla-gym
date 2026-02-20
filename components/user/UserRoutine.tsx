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
  description?: string;
  muscle_group: string;
  instructions?: string;
  exercise_images?: ExerciseImage[];
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

interface Routine {
  id: string;
  name: string;
  routine_exercises: RoutineExercise[];
}

interface UserRoutineProps {
  routine: Routine | null;
}

function ImageCarousel({ images }: { images: ExerciseImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
        <span className="text-4xl opacity-20">🏋️</span>
      </div>
    );
  }

  const sortedImages = [...images].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
    );
  };

  return (
    <div className="relative w-full">
      {/* Imagen principal */}
      <div className="relative w-full h-80 bg-gray-700 rounded-lg overflow-hidden group">
        <Image
          src={sortedImages[currentIndex].image_url}
          alt={`Paso ${currentIndex + 1}`}
          fill
          className="object-contain"
        />

        {/* Controles */}
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

            {/* Indicador de paso */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              Paso {currentIndex + 1} de {sortedImages.length}
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
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
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
  );
}

export function UserRoutine({ routine }: UserRoutineProps) {
  if (!routine) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <span className="text-6xl mb-4 block">🏋️</span>
        <h2 className="text-xl font-bold text-white mb-2">
          Aún no tienes una rutina asignada
        </h2>
        <p className="text-gray-400">
          Tu entrenador te asignará una rutina personalizada pronto
        </p>
      </div>
    );
  }

  const sortedExercises = [...routine.routine_exercises].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {routine.name}
            </h2>
            <p className="text-gray-400">
              {sortedExercises.length} ejercicio
              {sortedExercises.length !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="text-4xl">🏋️</span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {sortedExercises.map((routineEx, index) => (
            <div
              key={routineEx.id}
              className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-5"
            >
              <div className="flex items-start space-x-4 mb-4">
                {/* Número del ejercicio */}
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>

                {/* Info del ejercicio */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {routineEx.exercise.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {routineEx.exercise.muscle_group}
                  </p>
                </div>
              </div>

              {/* Carrusel de imágenes */}
              <div className="mb-4">
                <ImageCarousel
                  images={routineEx.exercise.exercise_images || []}
                />
              </div>

              {/* Stats del ejercicio */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Series</p>
                  <p className="text-white font-bold text-lg">
                    {routineEx.sets}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Repeticiones</p>
                  <p className="text-white font-bold text-lg">
                    {routineEx.reps}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Descanso</p>
                  <p className="text-white font-bold text-lg">
                    {routineEx.rest_seconds}s
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {routineEx.exercise.description && (
                <div className="mb-3">
                  <p className="text-gray-300 text-sm">
                    {routineEx.exercise.description}
                  </p>
                </div>
              )}

              {/* Instrucciones */}
              {routineEx.exercise.instructions && (
                <details className="group">
                  <summary className="cursor-pointer text-green-400 text-sm font-medium hover:text-green-300 list-none">
                    <span className="inline-flex items-center">
                      <span className="mr-2 group-open:rotate-90 transition-transform">
                        ▶
                      </span>
                      Cómo realizar el ejercicio
                    </span>
                  </summary>
                  <div className="mt-3 pl-6">
                    <div className="text-gray-300 text-sm whitespace-pre-line">
                      {routineEx.exercise.instructions}
                    </div>
                  </div>
                </details>
              )}

              {/* Notas del entrenador */}
              {routineEx.notes && (
                <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    <span className="font-semibold">
                      💬 Nota del entrenador:
                    </span>{" "}
                    {routineEx.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips generales */}
        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-2">💡 Consejos:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Calienta 5-10 minutos antes de empezar</li>
            <li>• Mantén una técnica correcta en cada ejercicio</li>
            <li>• Respeta los tiempos de descanso entre series</li>
            <li>• Hidrátate durante el entrenamiento</li>
            <li>• Si sientes dolor, consulta con tu entrenador</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
