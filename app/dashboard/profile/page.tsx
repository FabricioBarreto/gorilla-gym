import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import { MembershipStatus } from "@/components/user/MembershipStatus";
import { MembershipHistory } from "@/components/user/MembershipHistory";
import { ChangePasswordButton } from "@/components/user/ChangePasswordButton";

export default async function UserProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Obtener membresía ACTIVA
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Obtener TODAS las membresías (historial)
  const { data: allMemberships } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.full_name || user.email || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de cambiar contraseña */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">👤 Mi Perfil</h1>
            <p className="text-gray-400 mt-2">
              Gestiona tu información personal y membresía
            </p>
          </div>
          <ChangePasswordButton />
        </div>

        {/* Información Personal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Nombre Completo</p>
              <p className="text-white font-medium">{profile?.full_name}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">DNI</p>
              <p className="text-white font-medium">{profile?.dni}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Teléfono</p>
              <p className="text-white font-medium">
                {profile?.phone || "No especificado"}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Miembro desde</p>
              <p className="text-white font-medium">
                {new Date(profile?.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de Membresía */}
          <div className="lg:col-span-2">
            <MembershipStatus membership={membership} />
          </div>

          {/* Historial de Pagos */}
          <div>
            <MembershipHistory memberships={allMemberships || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
