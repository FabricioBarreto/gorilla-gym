export type UserRole = "admin" | "trainer" | "member";
export type MembershipStatus = "active" | "expired" | "suspended";
export type PaymentStatus = "pending" | "paid" | "overdue";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  dni?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseImage {
  id: string;
  exercise_id: string;
  image_url: string;
  order_index: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_group: string;
  image_url?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
  exercise_images?: ExerciseImage[];
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  created_at: string;
  exercise?: Exercise;
}

// Tipos extendidos con relaciones
export interface RoutineWithExercises extends Routine {
  routine_exercises: RoutineExercise[];
}

export interface MemberWithDetails extends Profile {
  membership?: Membership;
  payments?: Payment[];
  routines?: Routine[];
}
