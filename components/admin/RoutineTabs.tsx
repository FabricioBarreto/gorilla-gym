"use client";

import { useState } from "react";
import { NewRoutineForm } from "./NewRoutineForm";
import { ExistingRoutinesList } from "./ExistingRoutinesList";

interface Member {
  id: string;
  full_name: string;
  dni?: string;
}

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
  exercise_images?: ExerciseImage[];
}

interface RoutineExercise {
  id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
  };
}

interface Routine {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    dni?: string;
  } | null;
  routine_exercises: RoutineExercise[];
}

interface RoutineTabsProps {
  members: Member[];
  exercises: Exercise[];
  existingRoutines: Routine[];
  adminId: string;
  preselectedMember?: string;
}

export function RoutineTabs({
  members,
  exercises,
  existingRoutines,
  adminId,
  preselectedMember,
}: RoutineTabsProps) {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

  return (
    <>
      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("new")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "new"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              ✨ Crear Nueva
            </button>
            <button
              onClick={() => setActiveTab("existing")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "existing"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              📋 Duplicar Existente
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "new" ? (
        <NewRoutineForm
          members={members}
          exercises={exercises}
          adminId={adminId}
          preselectedMember={preselectedMember}
        />
      ) : (
        <ExistingRoutinesList
          routines={existingRoutines}
          members={members}
          adminId={adminId}
          preselectedMember={preselectedMember}
        />
      )}
    </>
  );
}
