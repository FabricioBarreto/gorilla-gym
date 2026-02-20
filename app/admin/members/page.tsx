import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MembersList } from "@/components/admin/MembersList";
import Link from "next/link";

export default async function MembersPage() {
  const supabase = await createAdminSupabaseClient();

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

  // Obtener todos los miembros
  const { data: allMembers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  // Para cada miembro, obtener su membresía ACTIVA más reciente
  const membersWithMemberships = await Promise.all(
    (allMembers || []).map(async (member) => {
      const { data: membership } = await supabase
        .from("memberships")
        .select("id, plan_type, start_date, end_date, status")
        .eq("user_id", member.id)
        .eq("status", "active") // ← SOLO ACTIVAS
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle(); // ← Puede ser null

      return {
        ...member,
        memberships: membership ? [membership] : [],
      };
    }),
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestión de Alumnos
            </h1>
            <p className="text-gray-400 mt-2">
              Administra todos los miembros del gimnasio
            </p>
          </div>

          <Link
            href="/admin/members/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Agregar Alumno</span>
          </Link>
        </div>

        <MembersList members={membersWithMemberships} />
      </main>
    </div>
  );
}
