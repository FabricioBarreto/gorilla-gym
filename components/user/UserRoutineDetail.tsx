'use client'

import { useState } from 'react'

interface Exercise {
  id: string
  name: string
  description?: string
  muscle_group: string
  instructions?: string
  exercise_images?: {
    id: string
    image_url: string
    order_index: number
  }[]
}

interface RoutineExercise {
  id: string
  sets: number
  reps: string
  rest_seconds: number
  notes?: string
  order_index: number
  exercise: Exercise
}

interface Routine {
  id: string
  name: string
  routine_exercises: RoutineExercise[]
}

interface UserRoutineDetailProps {
  routine: Routine
}

export function UserRoutineDetail({ routine }: UserRoutineDetailProps) {
  const [selectedExercise, setSelectedExercise] = useState<RoutineExercise | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Debug: Mostrar en consola
  console.log('Routine received:', routine)
  console.log('Exercises count:', routine.routine_exercises?.length)

  if (!routine || !routine.routine_exercises) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <p className="text-red-400">Error: No se pudo cargar la rutina</p>
        <pre className="text-xs text-gray-400 mt-2">
          {JSON.stringify(routine, null, 2)}
        </pre>
      </div>
    )
  }

  const exercises = routine.routine_exercises.sort((a, b) => a.order_index - b.order_index)

  if (exercises.length === 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
        <p className="text-yellow-400">Esta rutina no tiene ejercicios asignados</p>
      </div>
    )
  }

  const totalExercises = exercises.length
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const estimatedDuration = Math.round(
    exercises.reduce((sum, ex) => sum + (ex.sets * 90 + ex.rest_seconds * ex.sets), 0) / 60
  )

  const handleExerciseClick = (exercise: RoutineExercise) => {
    setSelectedExercise(exercise)
    setCurrentImageIndex(0)
  }

  const closeModal = () => {
    setSelectedExercise(null)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    if (selectedExercise?.exercise.exercise_images) {
      setCurrentImageIndex((prev) =>
        prev < selectedExercise.exercise.exercise_images!.length - 1 ? prev + 1 : 0
      )
    }
  }

  const prevImage = () => {
    if (selectedExercise?.exercise.exercise_images) {
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : selectedExercise.exercise.exercise_images!.length - 1
      )
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{routine.name}</h1>
        <p className="text-gray-400">Tu plan de entrenamiento personalizado</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Ejercicios</p>
          <p className="text-white text-2xl font-bold">{totalExercises}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Series totales</p>
          <p className="text-white text-2xl font-bold">{totalSets}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Duración estimada</p>
          <p className="text-white text-2xl font-bold">{estimatedDuration} min</p>
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="space-y-4">
        {exercises.map((routineExercise, index) => {
          const exercise = routineExercise.exercise
          const firstImage = exercise.exercise_images?.[0]

          return (
            <div
              key={routineExercise.id}
              onClick={() => handleExerciseClick(routineExercise)}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                {/* Número */}
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>

                {/* Imagen preview */}
                {firstImage && (
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={firstImage.image_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Información */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{exercise.name}</h3>
                  <p className="text-green-400 text-sm mb-2">{exercise.muscle_group}</p>

                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-400">Series:</span>
                      <span className="text-white font-bold ml-2">{routineExercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Reps:</span>
                      <span className="text-white font-bold ml-2">{routineExercise.reps}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Descanso:</span>
                      <span className="text-white font-bold ml-2">{routineExercise.rest_seconds}s</span>
                    </div>
                  </div>

                  {routineExercise.notes && (
                    <p className="text-gray-400 text-sm mt-2 italic">
                      💡 {routineExercise.notes}
                    </p>
                  )}
                </div>

                {/* Indicador de más info */}
                <div className="flex-shrink-0">
                  <span className="text-gray-500 text-2xl">→</span>
                </div>
              </div>
            </div>
          )
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
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedExercise.exercise.name}
                  </h2>
                  <p className="text-green-400">{selectedExercise.exercise.muscle_group}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Carousel de imágenes */}
              {selectedExercise.exercise.exercise_images && selectedExercise.exercise.exercise_images.length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={selectedExercise.exercise.exercise_images[currentImageIndex].image_url}
                      alt={`${selectedExercise.exercise.name} - paso ${currentImageIndex + 1}`}
                      className="w-full h-96 object-contain"
                    />

                    {selectedExercise.exercise.exercise_images.length > 1 && (
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
                          {selectedExercise.exercise.exercise_images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full ${
                                idx === currentImageIndex ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Configuración */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-green-400 font-bold mb-3">📊 Configuración</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Series</p>
                    <p className="text-white text-xl font-bold">{selectedExercise.sets}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Repeticiones</p>
                    <p className="text-white text-xl font-bold">{selectedExercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Descanso</p>
                    <p className="text-white text-xl font-bold">{selectedExercise.rest_seconds}s</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {selectedExercise.exercise.description && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">📝 Descripción</h3>
                  <p className="text-gray-300">{selectedExercise.exercise.description}</p>
                </div>
              )}

              {/* Instrucciones */}
              {selectedExercise.exercise.instructions && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">📋 Instrucciones</h3>
                  <p className="text-gray-300 whitespace-pre-line">
                    {selectedExercise.exercise.instructions}
                  </p>
                </div>
              )}

              {/* Notas del entrenador */}
              {selectedExercise.notes && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-blue-400 font-bold mb-2">💡 Nota del entrenador</h3>
                  <p className="text-gray-300">{selectedExercise.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}