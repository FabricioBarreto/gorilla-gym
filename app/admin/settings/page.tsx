import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { PriceSettings } from "@/components/admin/PriceSettings";

export default async function SettingsPage() {
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

  // Obtener precios actuales
  const { data: prices } = await supabase
    .from("membership_prices")
    .select("*")
    .order("plan_type");

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || "Admin"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">⚙️ Configuración</h1>
          <p className="text-gray-400 mt-2">
            Gestiona los precios de las membresías y otras configuraciones
          </p>
        </div>

        <PriceSettings prices={prices || []} />
      </main>
    </div>
  );
}
