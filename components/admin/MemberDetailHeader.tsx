"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";

interface Member {
  id: string;
  full_name: string;
  dni?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

interface MemberDetailHeaderProps {
  member: Member;
}

export function MemberDetailHeader({ member }: MemberDetailHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: member.full_name,
    dni: member.dni || "",
    phone: member.phone || "",
  });

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          dni: formData.dni,
          phone: formData.phone,
        })
        .eq("id", member.id);

      if (updateError) throw updateError;

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: member.full_name,
      dni: member.dni || "",
      phone: member.phone || "",
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {member.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {member.full_name}
              </h1>
              <p className="text-gray-400 text-sm">
                Miembro desde{" "}
                {new Date(member.created_at).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                ✏️ Editar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DNI
                </label>
                <input
                  type="text"
                  pattern="\d{7,8}"
                  maxLength={8}
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dni: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">DNI</p>
              <p className="text-white font-medium">
                {member.dni || "No especificado"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Teléfono</p>
              <p className="text-white font-medium">
                {member.phone || "No especificado"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">ID de Usuario</p>
              <p className="text-white font-medium text-xs">
                {member.id.substring(0, 8)}...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botón de Resetear Contraseña - SIEMPRE VISIBLE */}
      <div className="mt-6">
        <ResetPasswordButton
          userId={member.id}
          userEmail={member.email || ""}
          userName={member.full_name}
        />
      </div>
    </>
  );
}
