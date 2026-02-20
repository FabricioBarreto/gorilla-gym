import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'
import { NewMemberForm } from '@/components/admin/NewMemberForm'
import Link from 'next/link'

export default async function NewMemberPage() {
  const supabase = await createAdminSupabaseClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verificar que sea admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={profile?.full_name || user.email || 'Admin'} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/members"
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a alumnos
          </Link>
          
          <h1 className="text-3xl font-bold text-white mt-4">Agregar Nuevo Alumno</h1>
          <p className="text-gray-400 mt-2">
            Registra un nuevo miembro y configura su membresía inicial
          </p>
        </div>

        <NewMemberForm />
      </main>
    </div>
  )
}