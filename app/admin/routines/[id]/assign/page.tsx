import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import Link from "next/link";
import { AssignMembersForm } from "@/components/admin/AssignMembersForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignRoutinePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAdminSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: routine } = await supabase
    .from("routines")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!routine) redirect("/admin/routines");

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, dni")
    .eq("role", "member")
    .order("full_name");

  const { data: currentAssignments } = await supabase
    .from("routine_assignments")
    .select("user_id")
    .eq("routine_id", id);

  const assignedUserIds = currentAssignments?.map((a) => a.user_id) || [];

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/admin/routines/${id}`}
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a la rutina
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Asignar: {routine.name}
          </h1>
          <p className="text-gray-400 mt-2">
            Seleccioná los alumnos a los que querés asignar esta rutina
          </p>
        </div>

        <AssignMembersForm
          routineId={id}
          routineName={routine.name}
          members={members || []}
          assignedUserIds={assignedUserIds}
          adminId={user.id}
        />
      </main>
    </div>
  );
}
