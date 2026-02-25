import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminsList } from "@/components/admin/AdminsList";
import prisma from "@/lib/prisma";

export default async function AdminsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const admins = await prisma.profile.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, dni: true, createdAt: true },
  });

  const adminsForComponent = admins.map((a) => ({
    id: a.id,
    full_name: a.fullName,
    dni: a.dni,
    created_at: a.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👑 Administradores</h1>
          <p className="text-gray-400 mt-2">
            Gestiona los administradores del sistema
          </p>
        </div>
        <AdminsList admins={adminsForComponent} currentAdminId={session.id} />
      </main>
    </div>
  );
}
