import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { NewMemberForm } from "@/components/admin/NewMemberForm";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function NewMemberPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const prices = await prisma.membershipPrice.findMany({
    orderBy: { planType: "asc" },
  });

  const plans = prices.map((p) => ({
    plan_type: p.planType,
    price: p.price,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/members"
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a alumnos
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Agregar Nuevo Alumno
          </h1>
          <p className="text-gray-400 mt-2">
            Registra un nuevo miembro y configura su membresía inicial
          </p>
        </div>
        <NewMemberForm plans={plans} />
      </main>
    </div>
  );
}
