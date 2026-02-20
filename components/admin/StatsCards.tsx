interface StatsCardsProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    monthlyRevenue: number;
    totalPayments: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Asegurar que todos los valores sean números válidos
  const totalMembers = stats?.totalMembers ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const totalRevenue = stats?.monthlyRevenue ?? 0;
  const totalPayments = stats?.totalPayments ?? 0;

  const cards = [
    {
      name: "Total de Alumnos",
      value: totalMembers.toString(),
      icon: "👥",
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Alumnos Activos",
      value: activeMembers.toString(),
      icon: "✅",
      color: "bg-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "Ingresos del Mes",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: "💰",
      color: "bg-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      name: "Pagos del Mes",
      value: totalPayments.toString(),
      icon: "📊",
      color: "bg-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} border border-gray-700 rounded-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{card.name}</p>
              <p className="text-white text-3xl font-bold mt-2">{card.value}</p>
            </div>
            <div
              className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center`}
            >
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
