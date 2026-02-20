'use client'

interface Membership {
  id: string
  plan_type: string
  created_at: string
  payment_method?: string
}

interface WeeklyRevenueProps {
  memberships: Membership[]
  prices: Record<string, number>
}

export function WeeklyRevenue({ memberships, prices }: WeeklyRevenueProps) {
  // Agrupar por día
  const revenueByDay: Record<string, { total: number; count: number; efectivo: number; transferencia: number }> = {}

  memberships.forEach((m) => {
    const date = new Date(m.created_at).toLocaleDateString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    
    if (!revenueByDay[date]) {
      revenueByDay[date] = { total: 0, count: 0, efectivo: 0, transferencia: 0 }
    }
    
    const amount = prices[m.plan_type] || 0
    revenueByDay[date].total += amount
    revenueByDay[date].count += 1
    
    if (m.payment_method === 'efectivo') {
      revenueByDay[date].efectivo += amount
    } else if (m.payment_method === 'transferencia') {
      revenueByDay[date].transferencia += amount
    }
  })

  const totalWeek = memberships.reduce((sum, m) => sum + (prices[m.plan_type] || 0), 0)
  const totalEfectivo = memberships
    .filter(m => m.payment_method === 'efectivo')
    .reduce((sum, m) => sum + (prices[m.plan_type] || 0), 0)
  const totalTransferencia = memberships
    .filter(m => m.payment_method === 'transferencia')
    .reduce((sum, m) => sum + (prices[m.plan_type] || 0), 0)

  const days = Object.entries(revenueByDay).reverse()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">📊 Ingresos de la Semana</h2>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-1">Total Semanal</p>
          <p className="text-white text-2xl font-bold">${totalWeek.toLocaleString()}</p>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-400 text-sm mb-1">💵 Efectivo</p>
          <p className="text-white text-xl font-bold">${totalEfectivo.toLocaleString()}</p>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-1">🏦 Transferencia</p>
          <p className="text-white text-xl font-bold">${totalTransferencia.toLocaleString()}</p>
        </div>
      </div>

      {/* Desglose por día */}
      {days.length > 0 ? (
        <div className="space-y-3">
          {days.map(([date, data]) => (
            <div key={date} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium capitalize">{date}</p>
                  <p className="text-gray-400 text-sm">{data.count} renovación{data.count !== 1 ? 'es' : ''}</p>
                </div>
                <p className="text-green-400 font-bold text-xl">${data.total.toLocaleString()}</p>
              </div>
              
              {/* Métodos de pago */}
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                {data.efectivo > 0 && (
                  <span>💵 ${data.efectivo.toLocaleString()}</span>
                )}
                {data.transferencia > 0 && (
                  <span>🏦 ${data.transferencia.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay ingresos esta semana</p>
        </div>
      )}
    </div>
  )
}