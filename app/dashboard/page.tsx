import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user/UserNav";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [profile, membership] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: session.id },
      select: { fullName: true, role: true },
    }),
    prisma.membership.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const getMembershipStatus = () => {
    if (!membership) return null;
    const today = new Date();
    const daysRemaining = Math.ceil(
      (membership.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return { daysRemaining };
  };

  const membershipStatus = getMembershipStatus();

  return (
    <div className="min-h-screen bg-gray-900">
      <UserNav userName={profile?.fullName || session.name || "Usuario"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            ¡Bienvenido, {profile?.fullName || session.name || "Usuario"}! 💪
          </h1>
          <p className="text-gray-400">
            Tu centro de entrenamiento personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Estado de Membresía */}
          <div
            className={`border-2 rounded-xl p-6 transition-all ${
              !membership
                ? "bg-gray-800 border-gray-700"
                : membershipStatus && membershipStatus.daysRemaining < 0
                  ? "bg-red-500/10 border-red-500/30"
                  : membershipStatus && membershipStatus.daysRemaining <= 7
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-4xl sm:text-5xl">
                {!membership
                  ? "⚠️"
                  : membershipStatus && membershipStatus.daysRemaining < 0
                    ? "👎"
                    : membershipStatus && membershipStatus.daysRemaining <= 7
                      ? "⚠️"
                      : "👍"}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Estado
              </h3>
            </div>
            <p
              className={`text-xl sm:text-2xl font-bold mb-2 ${
                !membership
                  ? "text-gray-400"
                  : membershipStatus && membershipStatus.daysRemaining < 0
                    ? "text-red-400"
                    : membershipStatus && membershipStatus.daysRemaining <= 7
                      ? "text-yellow-400"
                      : "text-green-400"
              }`}
            >
              {!membership
                ? "Sin Membresía"
                : membershipStatus && membershipStatus.daysRemaining < 0
                  ? "Vencida"
                  : membershipStatus && membershipStatus.daysRemaining <= 7
                    ? "Por Vencer"
                    : "Activa"}
            </p>
            <p className="text-sm text-gray-400">
              {!membership
                ? "Contacta al administrador"
                : membershipStatus && membershipStatus.daysRemaining < 0
                  ? `Venció hace ${Math.abs(membershipStatus.daysRemaining)} días`
                  : membershipStatus
                    ? `Vence en ${membershipStatus.daysRemaining} días`
                    : "Contacta al administrador"}
            </p>
          </div>

          {/* Vencimiento */}
          <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-4xl sm:text-5xl">⏰</span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Vencimiento
              </h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2">
              {membership?.endDate
                ? membership.endDate.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
            <p className="text-sm text-gray-400">Fecha de vencimiento</p>
          </div>
        </div>

        {/* Rutinas por Categoría */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Rutinas de Entrenamiento
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/dashboard/routines/men"
              className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-700 hover:border-blue-500 rounded-xl p-8 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-6xl">💪</span>
                <span className="text-blue-400 group-hover:text-blue-300 text-2xl">
                  →
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Rutinas Hombres
              </h3>
              <p className="text-gray-300">
                Programas de entrenamiento para hombres
              </p>
            </Link>

            <Link
              href="/dashboard/routines/women"
              className="group bg-gradient-to-br from-pink-900/30 to-pink-800/20 border-2 border-pink-700 hover:border-pink-500 rounded-xl p-8 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-6xl">🏋️‍♀️</span>
                <span className="text-pink-400 group-hover:text-pink-300 text-2xl">
                  →
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                Rutinas Mujeres
              </h3>
              <p className="text-gray-300">
                Programas de entrenamiento para mujeres
              </p>
            </Link>
          </div>
        </div>

        {/* Acceso Rápido */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Rápido</h2>
          <div className="max-w-md mx-auto">
            <Link
              href="/dashboard/exercises"
              className="group bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl p-8 transition-all hover:scale-105 block"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-400 group-hover:text-green-300 text-2xl">
                  →
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                Biblioteca de Ejercicios
              </h3>
              <p className="text-gray-400">
                Explora ejercicios por grupo muscular
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
