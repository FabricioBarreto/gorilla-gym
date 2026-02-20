"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getRoutinesOffline, saveRoutinesOffline } from "@/lib/offline-storage";
import Link from "next/link";

interface OfflineRoutinesLoaderProps {
  initialRoutines: any[] | null;
  userId: string;
}

export function OfflineRoutinesLoader({
  initialRoutines,
  userId,
}: OfflineRoutinesLoaderProps) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [loading, setLoading] = useState(!initialRoutines);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    async function loadRoutines() {
      // Si no hay datos online, cargar desde IndexedDB
      if (!initialRoutines) {
        setLoading(true);
        const offlineRoutines = await getRoutinesOffline();
        setRoutines(offlineRoutines);
        setLoading(false);
      } else {
        // Si hay datos online, guardarlos para uso offline
        await saveRoutinesOffline(initialRoutines);
        setRoutines(initialRoutines);
      }
    }

    loadRoutines();
  }, [initialRoutines]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">🏋️</div>
        <p className="text-gray-400">Cargando rutinas...</p>
      </div>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏋️</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay rutinas disponibles
        </h3>
        <p className="text-gray-400">
          {isOnline
            ? "Contacta al administrador para crear rutinas"
            : "Conectate a internet para descargar rutinas"}
        </p>
      </div>
    );
  }

  // Calcular datos de cada rutina
  const routinesWithCount = routines.map((routine) => ({
    ...routine,
    exerciseCount:
      routine.routine_days?.reduce((total: number, day: any) => {
        return total + (day.routine_exercises?.[0]?.count || 0);
      }, 0) || 0,
    dayCount: routine.routine_days?.length || 0,
  }));

  const menRoutines = routinesWithCount.filter((r) => r.category === "hombres");
  const womenRoutines = routinesWithCount.filter(
    (r) => r.category === "mujeres",
  );

  return (
    <>
      {/* Indicador de modo offline */}
      {!isOnline && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📡</span>
            <div>
              <p className="text-yellow-400 font-bold text-sm">Modo Offline</p>
              <p className="text-yellow-300 text-xs">
                Viendo rutinas guardadas. Conectate para actualizar.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-400 mb-8">
        Explora {routinesWithCount.length} rutinas de entrenamiento
      </p>

      {/* Rutinas Hombres */}
      {menRoutines.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-4xl">💪</span>
            <h2 className="text-3xl font-bold text-white">Rutinas Hombres</h2>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {menRoutines.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/dashboard/routines/men/${routine.id}`}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-blue-500 rounded-xl p-6 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">🏋️</div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                    {routine.dayCount} días
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {routine.name}
                </h3>

                {routine.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {routine.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-500 text-sm">
                    {routine.exerciseCount} ejercicios
                  </span>
                  <span className="text-blue-400 group-hover:text-blue-300 text-sm">
                    Ver rutina →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Rutinas Mujeres */}
      {womenRoutines.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-4xl">🏋️‍♀️</span>
            <h2 className="text-3xl font-bold text-white">Rutinas Mujeres</h2>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
              {womenRoutines.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {womenRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/dashboard/routines/women/${routine.id}`}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-pink-500 rounded-xl p-6 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">💪</div>
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs font-medium">
                    {routine.dayCount} días
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                  {routine.name}
                </h3>

                {routine.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {routine.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-500 text-sm">
                    {routine.exerciseCount} ejercicios
                  </span>
                  <span className="text-pink-400 group-hover:text-pink-300 text-sm">
                    Ver rutina →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
