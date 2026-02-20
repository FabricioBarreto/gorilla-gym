'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Membership {
  id: string
  plan_type: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'suspended'
  payment_method?: string
}

interface MemberMembershipSimpleProps {
  membership: Membership | null
  memberId: string
}

export function MemberMembershipSimple({ membership, memberId }: MemberMembershipSimpleProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [showRenewForm, setShowRenewForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedPlan, setSelectedPlan] = useState('mensual')
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')

  const planPrices = {
    quincenal: 8000,
    mensual: 15000,
    trimestral: 40000,
    anual: 150000,
  }

  const planLabels = {
    quincenal: 'Quincenal',
    mensual: 'Mensual',
    trimestral: 'Trimestral',
    anual: 'Anual',
  }

  const planDurations = {
    quincenal: 15,
    mensual: 30,
    trimestral: 90,
    anual: 365,
  }

  const calculateEndDate = (startDate: Date, planType: string) => {
    const end = new Date(startDate)
    
    if (planType === 'quincenal') {
      end.setDate(end.getDate() + 15)
    } else if (planType === 'mensual') {
      end.setMonth(end.getMonth() + 1)
    } else if (planType === 'trimestral') {
      end.setMonth(end.getMonth() + 3)
    } else {
      end.setFullYear(end.getFullYear() + 1)
    }
    
    return end.toISOString().split('T')[0]
  }

  const handleRenew = async () => {
    setLoading(true)
    setError(null)

    try {
      const today = new Date()
      const endDate = calculateEndDate(today, selectedPlan)

      // Marcar membresía anterior como expirada si existe
      if (membership) {
        await supabase
          .from('memberships')
          .update({ status: 'expired' })
          .eq('id', membership.id)
      }

      // Crear nueva membresía
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: memberId,
          plan_type: selectedPlan,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate,
          status: 'active',
          payment_method: paymentMethod,
        })

      if (membershipError) throw membershipError

      setShowRenewForm(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = () => {
    if (!membership) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const endDate = new Date(membership.end_date)
    endDate.setHours(0, 0, 0, 0)
    
    const diffTime = endDate.getTime() - today.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return days
  }

  const getStatusDisplay = () => {
    const daysRemaining = getDaysRemaining()
    
    if (daysRemaining === null) return { color: 'text-gray-400', text: 'Sin membresía', icon: '❌' }
    
    if (daysRemaining < 0) {
      return { 
        color: 'text-red-400', 
        text: `Venció hace ${Math.abs(daysRemaining)} día${Math.abs(daysRemaining) !== 1 ? 's' : ''}`,
        icon: '❌'
      }
    }
    
    if (daysRemaining === 0) {
      return { color: 'text-orange-400', text: 'Vence HOY', icon: '⚠️' }
    }
    
    if (daysRemaining <= 3) {
      return { color: 'text-orange-400', text: `Vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`, icon: '⚠️' }
    }
    
    return { color: 'text-green-400', text: `${daysRemaining} días restantes`, icon: '✅' }
  }

  const status = getStatusDisplay()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">💳 Membresía</h2>
        {!showRenewForm && (
          <button
            onClick={() => setShowRenewForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            {membership ? '🔄 Renovar' : '➕ Crear'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {showRenewForm ? (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              ℹ️ Selecciona el tipo de membresía y método de pago. La fecha de inicio será hoy.
            </p>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-white font-medium mb-3">💰 Método de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">💵</span>
                  <span className="text-white font-medium">Efectivo</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🏦</span>
                  <span className="text-white font-medium">Transferencia</span>
                </div>
              </button>
            </div>
          </div>

          {/* Selector de Planes */}
          <div>
            <label className="block text-white font-medium mb-3">📋 Plan de Membresía</label>
            <div className="space-y-3">
              {Object.entries(planPrices).map(([plan, price]) => {
                const days = planDurations[plan as keyof typeof planDurations]
                const endDate = calculateEndDate(new Date(), plan)
                
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPlan === plan
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan ? 'border-green-500 bg-green-500' : 'border-gray-500'
                          }`}>
                            {selectedPlan === plan && <span className="text-white text-xs">✓</span>}
                          </span>
                          <p className="text-white font-bold text-lg">
                            {planLabels[plan as keyof typeof planLabels]}
                          </p>
                        </div>
                        
                        <div className="ml-8 space-y-1">
                          <p className="text-green-400 font-bold text-xl">
                            ${price.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Duración: {days} días
                          </p>
                          <p className="text-gray-400 text-sm">
                            Vence: {new Date(endDate).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setShowRenewForm(false)
                setError(null)
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRenew}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Procesando...' : membership ? 'Confirmar Renovación' : 'Crear Membresía'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {membership ? (
            <div className="space-y-6">
              {/* Estado destacado */}
              <div className={`rounded-lg p-6 text-center border-2 ${
                getDaysRemaining()! < 0 ? 'bg-red-500/10 border-red-500' :
                getDaysRemaining()! <= 3 ? 'bg-orange-500/10 border-orange-500' :
                'bg-green-500/10 border-green-500'
              }`}>
                <p className="text-gray-300 text-sm mb-2">Estado de Membresía</p>
                <p className={`text-4xl font-bold mb-2 ${status.color}`}>
                  {status.icon}
                </p>
                <p className={`text-2xl font-bold ${status.color}`}>
                  {status.text}
                </p>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Plan</p>
                  <p className="text-white font-bold text-lg">
                    {planLabels[membership.plan_type as keyof typeof planLabels]}
                  </p>
                  <p className="text-green-400 font-semibold">
                    ${planPrices[membership.plan_type as keyof typeof planPrices]?.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Fecha de Vencimiento</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(membership.end_date).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Inicio de Membresía</p>
                  <p className="text-white">
                    {new Date(membership.start_date).toLocaleDateString('es-AR')}
                  </p>
                </div>

                {membership.payment_method && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Método de Pago</p>
                    <p className="text-white flex items-center space-x-2">
                      <span>{membership.payment_method === 'efectivo' ? '💵' : '🏦'}</span>
                      <span className="capitalize">{membership.payment_method}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4 text-6xl">🏋️</div>
              <p className="text-gray-400 text-lg mb-4">Este alumno no tiene membresía</p>
              <button
                onClick={() => setShowRenewForm(true)}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Crear membresía →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}