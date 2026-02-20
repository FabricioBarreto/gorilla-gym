interface RecentRenewal {
  id: string;
  plan_type: string;
  payment_method: string;
  created_at: string;
  profiles:
    | {
        id: string;
        full_name: string;
        dni: string;
      }[]
    | null; // ← Cambiar a array
}

interface RecentRenewalsProps {
  renewals: RecentRenewal[];
  prices: any;
}

export function RecentRenewals({ renewals, prices }: RecentRenewalsProps) {
  const getPlanPrice = (planType: string) => {
    return prices[planType] || 0; // ← prices ya es un objeto Record<string, number>
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!renewals || renewals.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Renovaciones Recientes
        </h2>
        <p className="text-gray-400 text-center py-8">
          No hay renovaciones recientes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Renovaciones Recientes
      </h2>

      <div className="space-y-1 divide-y divide-gray-700">
        {renewals.map((renewal) => {
          // ← Obtener el primer perfil del array
          const profile = renewal.profiles?.[0];

          return (
            <div
              key={renewal.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile?.full_name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {profile?.full_name || "Usuario desconocido"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    DNI: {profile?.dni || "N/A"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-green-400 font-bold">
                  ${getPlanPrice(renewal.plan_type).toLocaleString("es-AR")}
                </p>
                <p className="text-gray-400 text-xs capitalize">
                  {renewal.plan_type} • {renewal.payment_method}
                </p>
                <p className="text-gray-500 text-xs">
                  {formatDate(renewal.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
