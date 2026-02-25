import prisma from "@/lib/prisma";
import Link from "next/link";

export async function ExpirationAlerts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const [expired, criticalExpiring, warningExpiring] = await Promise.all([
    // Vencidas
    prisma.membership.findMany({
      where: { status: "active", endDate: { lt: today } },
      include: { user: { select: { id: true, fullName: true, dni: true } } },
      orderBy: { endDate: "desc" },
    }),
    // Vencen en 0-3 días
    prisma.membership.findMany({
      where: {
        status: "active",
        endDate: { gte: today, lte: threeDaysFromNow },
      },
      include: { user: { select: { id: true, fullName: true, dni: true } } },
      orderBy: { endDate: "asc" },
    }),
    // Vencen en 4-7 días
    prisma.membership.findMany({
      where: {
        status: "active",
        endDate: { gt: threeDaysFromNow, lte: sevenDaysFromNow },
      },
      include: { user: { select: { id: true, fullName: true, dni: true } } },
      orderBy: { endDate: "asc" },
    }),
  ]);

  const getDaysUntilExpiration = (endDate: Date) => {
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalAlerts =
    expired.length + criticalExpiring.length + warningExpiring.length;
  if (totalAlerts === 0) return null;

  return (
    <div className="space-y-4">
      {/* Vencidas */}
      {expired.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="text-red-400 font-bold">Membresías Vencidas</h3>
              <p className="text-red-300 text-sm">
                {expired.length} alumno{expired.length !== 1 ? "s" : ""} con
                membresía vencida
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expired.map((m) => {
              const daysAgo = Math.abs(getDaysUntilExpiration(m.endDate));
              return (
                <Link
                  key={m.id}
                  href={`/admin/members/${m.user.id}`}
                  className="block bg-red-900/20 hover:bg-red-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {m.user.fullName}
                      </p>
                      <p className="text-red-300 text-sm">
                        DNI: {m.user.dni} • Vencida hace {daysAgo} día
                        {daysAgo !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-red-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Críticas 0-3 días */}
      {criticalExpiring.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-orange-400 font-bold">
                Vencen en 3 días o menos
              </h3>
              <p className="text-orange-300 text-sm">
                {criticalExpiring.length} membresía
                {criticalExpiring.length !== 1 ? "s" : ""} próxima
                {criticalExpiring.length !== 1 ? "s" : ""} a vencer
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {criticalExpiring.map((m) => {
              const days = getDaysUntilExpiration(m.endDate);
              return (
                <Link
                  key={m.id}
                  href={`/admin/members/${m.user.id}`}
                  className="block bg-orange-900/20 hover:bg-orange-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {m.user.fullName}
                      </p>
                      <p className="text-orange-300 text-sm">
                        DNI: {m.user.dni} • Vence en {days} día
                        {days !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-orange-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Advertencia 4-7 días */}
      {warningExpiring.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h3 className="text-yellow-400 font-bold">
                Vencen próximamente (4-7 días)
              </h3>
              <p className="text-yellow-300 text-sm">
                {warningExpiring.length} membresía
                {warningExpiring.length !== 1 ? "s" : ""} a renovar pronto
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {warningExpiring.map((m) => {
              const days = getDaysUntilExpiration(m.endDate);
              return (
                <Link
                  key={m.id}
                  href={`/admin/members/${m.user.id}`}
                  className="block bg-yellow-900/20 hover:bg-yellow-900/30 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {m.user.fullName}
                      </p>
                      <p className="text-yellow-300 text-sm">
                        DNI: {m.user.dni} • Vence en {days} días
                      </p>
                    </div>
                    <span className="text-yellow-400 text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
