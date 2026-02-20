import { createClient } from "@/lib/supabase";
import {
  saveRoutinesOffline,
  saveExercisesOffline,
  saveMembershipOffline,
  getRoutinesOffline,
  getExercisesOffline,
  getMembershipOffline,
} from "./offline-storage";

export async function syncDataToOffline(userId: string) {
  try {
    const supabase = createClient();

    // 1. Sincronizar rutinas completas
    const { data: routines } = await supabase
      .from("routines")
      .select(
        `
        *,
        routine_days (
          *,
          routine_exercises (
            *,
            exercise:exercises (
              *,
              exercise_images (*)
            )
          )
        )
      `,
      )
      .order("name");

    if (routines) {
      await saveRoutinesOffline(routines);
    }

    // 2. Sincronizar todos los ejercicios
    const { data: exercises } = await supabase
      .from("exercises")
      .select(
        `
        *,
        exercise_images (*)
      `,
      )
      .order("name");

    if (exercises) {
      await saveExercisesOffline(exercises);
    }

    // 3. Sincronizar membresía
    const { data: membership } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (membership) {
      await saveMembershipOffline(membership);
    }

    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Error syncing data:", error);
    return { success: false, error };
  }
}

export async function getDataOffline() {
  return {
    routines: await getRoutinesOffline(),
    exercises: await getExercisesOffline(),
    membership: await getMembershipOffline(),
  };
}
