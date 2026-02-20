"use client";

import { useState } from "react";
import Link from "next/link";

interface RoutineUser {
  id: string;
  full_name: string;
  dni?: string;
}

interface Routine {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  user: RoutineUser | null;
  routine_exercises: { id: string }[];
}

interface RoutinesListProps {
  routines: Routine[];
}

export function RoutinesList({ routines }: RoutinesListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutines = routines.filter(
    (routine) =>
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar rutina o alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="text-gray-400 text-sm">
            {filteredRoutines.length} rutina
            {filteredRoutines.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Rutinas</p>
              <p className="text-white text-2xl font-bold">{routines.length}</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Alumnos con Rutina</p>
              <p className="text-white text-2xl font-bold">
                {new Set(routines.map((r) => r.user_id)).size}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ejercicios Totales</p>
              <p className="text-white text-2xl font-bold">
                {routines.reduce(
                  (sum, r) => sum + r.routine_exercises.length,
                  0,
                )}
              </p>
            </div>
            <span className="text-3xl">🏋️</span>
          </div>
        </div>
      </div>

      {/* Lista de rutinas */}
      {filteredRoutines.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📋</span>
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm
              ? "No se encontraron rutinas"
              : "No hay rutinas creadas"}
          </p>
          {!searchTerm && (
            <Link
              href="/admin/routines/new"
              className="text-green-500 hover:text-green-400 inline-block mt-2"
            >
              Crear la primera rutina →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <Link
              key={routine.id}
              href={`/admin/routines/${routine.id}`}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                    {routine.name}
                  </h3>
                  {routine.user && (
                    <p className="text-gray-400 text-sm">
                      👤 {routine.user.full_name}
                      {routine.user.dni && (
                        <span className="text-gray-500 ml-2">
                          DNI: {routine.user.dni}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <span className="text-2xl">📋</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Ejercicios:</span>
                  <span className="text-white font-semibold">
                    {routine.routine_exercises.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Creada:</span>
                  <span className="text-white">
                    {new Date(routine.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className="text-green-400 text-sm group-hover:text-green-300">
                  Ver detalles →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
