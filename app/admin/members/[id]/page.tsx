import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MemberDetailHeader } from "@/components/admin/MemberDetailHeader";
import { MemberMembershipSimple } from "@/components/admin/MemberMembershipSimple";
import { AssignRoutineButton } from "@/components/admin/AssignRoutineButton";
import { MembershipHistory } from "@/components/admin/MembershipHistory";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener datos del miembro
  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) {
    redirect("/admin/members");
  }

  // Obtener la membresía ACTIVA
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", id)
    .eq("status", "active")
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Obtener TODAS las membresías (historial)
  const { data: allMemberships } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Obtener rutina asignada
  const { data: routineAssignment } = await supabase
    .from("routine_assignments")
    .select(
      `
      *,
      routine:routines (
        id,
        name
      )
    `,
    )
    .eq("user_id", id)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Obtener todas las rutinas disponibles
  const { data: availableRoutines } = await supabase
    .from("routines")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <MemberDetailHeader member={member} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Membresía */}
          <MemberMembershipSimple
            membership={membership}
            memberId={member.id}
          />

          {/* Rutina */}
          <AssignRoutineButton
            memberId={member.id}
            currentRoutine={routineAssignment?.routine || null}
            availableRoutines={availableRoutines || []}
          />
        </div>

        {/* Historial de Renovaciones */}
        <div className="mt-6">
          <MembershipHistory
            memberships={allMemberships || []}
            memberName={member.full_name}
          />
        </div>

        {/* Botón Eliminar */}
        <div className="mt-6">
          <DeleteUserButton
            memberId={member.id}
            memberName={member.full_name}
          />
        </div>
      </main>
    </div>
  );
}
