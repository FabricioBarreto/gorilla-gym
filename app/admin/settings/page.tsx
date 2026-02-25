import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { PriceSettings } from "@/components/admin/PriceSettings";
import prisma from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const prices = await prisma.membershipPrice.findMany({
    orderBy: { planType: "asc" },
  });

  // Adaptar al formato snake_case que espera PriceSettings
  const pricesForComponent = prices.map((p) => ({
    id: p.id,
    plan_type: p.planType,
    price: p.price,
    updated_at: p.updatedAt.toISOString(),
    updated_by: p.updatedBy,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">⚙️ Configuración</h1>
          <p className="text-gray-400 mt-2">
            Gestiona los precios de las membresías y otras configuraciones
          </p>
        </div>
        <PriceSettings prices={pricesForComponent} />
      </main>
    </div>
  );
}
