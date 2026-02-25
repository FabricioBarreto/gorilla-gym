"use client";

import { useState } from "react";
import Link from "next/link";

interface Membership {
  plan_type: string;
  status: string;
  end_date: string;
}

interface Member {
  id: string;
  full_name: string;
  dni?: string;
  phone?: string;
  created_at: string;
  memberships: Membership[];
}

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");

  const getVencimientoInfo = (membership: Membership) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vencimiento = new Date(membership.end_date);
    vencimiento.setHours(0, 0, 0, 0);

    const diffTime = vencimiento.getTime() - today.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const estaVencido = membership.status === "expired" || diasRestantes < 0;

    if (estaVencido) {
      return {
        texto:
          diasRestantes < 0
            ? `Venció hace ${Math.abs(diasRestantes)}d`
            : "Vencido",
        color: "text-red-400 bg-red-500/10",
        badge: "bg-red-500",
        icon: "❌",
        isActive: false,
      };
    } else if (diasRestantes === 0) {
      return {
        texto: "Vence HOY",
        color: "text-orange-400 bg-orange-500/10",
        badge: "bg-orange-500",
        icon: "⚠️",
        isActive: true,
      };
    } else if (diasRestantes <= 3) {
      return {
        texto: `Vence en ${diasRestantes}d`,
        color: "text-orange-400 bg-orange-500/10",
        badge: "bg-orange-500",
        icon: "⚠️",
        isActive: true,
      };
    } else {
      return {
        texto: `${diasRestantes} días`,
        color: "text-green-400 bg-green-500/10",
        badge: "bg-green-500",
        icon: "✅",
        isActive: true,
      };
    }
  };

  const planLabels: Record<string, string> = {
    quincenal: "Quincenal",
    mensual: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  // Filtrar por búsqueda
  const searchFiltered = members.filter((member) => {
    const search = searchTerm.toLowerCase();
    return (
      (member.full_name ?? "").toLowerCase().includes(search) ||
      member.dni?.toLowerCase().includes(search)
    );
  });

  // Filtrar por estado
  const filteredMembers = searchFiltered.filter((member) => {
    if (statusFilter === "all") return true;

    const membership = member.memberships[0];
    if (!membership) return statusFilter === "expired"; // Sin membresía = inactivo

    const vencimientoInfo = getVencimientoInfo(membership);

    if (statusFilter === "active") {
      return vencimientoInfo.isActive;
    } else {
      return !vencimientoInfo.isActive;
    }
  });

  // Contar por estado
  const activeCount = members.filter((m) => {
    const membership = m.memberships[0];
    if (!membership) return false;
    return getVencimientoInfo(membership).isActive;
  }).length;

  const expiredCount = members.length - activeCount;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Búsqueda y Filtros */}
      <div className="p-4 border-b border-gray-700 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            📊 Todos ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ✅ Activos ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("expired")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "expired"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ❌ Vencidos ({expiredCount})
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Alumno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredMembers.map((member) => {
              const membership = member.memberships[0];
              const vencimientoInfo = membership
                ? getVencimientoInfo(membership)
                : null;

              return (
                <tr key={member.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-white font-medium">
                        {member.full_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        DNI: {member.dni || "Sin DNI"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-300 text-sm">
                      {member.phone || "Sin teléfono"}
                    </p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {membership ? (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                        {planLabels[membership.plan_type] ||
                          membership.plan_type}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin plan</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {membership && vencimientoInfo ? (
                      <div className="flex items-center space-x-2">
                        <span
                          className={`${vencimientoInfo.badge} w-2 h-2 rounded-full`}
                        ></span>
                        <div>
                          <p
                            className={`text-sm font-medium ${vencimientoInfo.color.split(" ")[0]}`}
                          >
                            {new Date(membership.end_date).toLocaleDateString(
                              "es-AR",
                            )}
                          </p>
                          <p
                            className={`text-xs ${vencimientoInfo.color.split(" ")[0]}`}
                          >
                            {vencimientoInfo.texto}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                      Ver detalles →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchTerm
                ? "No se encontraron alumnos"
                : statusFilter === "active"
                  ? "No hay alumnos activos"
                  : statusFilter === "expired"
                    ? "No hay alumnos vencidos"
                    : "No hay alumnos registrados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
