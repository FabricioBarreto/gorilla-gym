import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no está logueado, redirigir a login
  if (!user) {
    redirect("/login");
  }

  // Si está logueado, obtener su rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirigir según el rol
  if (profile?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}
