// ============================================================
// ARCHIVO: app/api/members/route.ts
// POST - Crear nuevo miembro
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, dni, phone, password, plan_type, start_date } = body;
    console.log(
      ">>> full_name recibido:",
      full_name,
      "| tipo:",
      typeof full_name,
    );

    // Validar DNI
    if (!/^\d{7,8}$/.test(dni)) {
      return NextResponse.json(
        { error: "El DNI debe tener 7 u 8 dígitos" },
        { status: 400 },
      );
    }

    // Verificar DNI no existe
    const existing = await prisma.profile.findUnique({ where: { dni } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un alumno con este DNI" },
        { status: 400 },
      );
    }

    // Calcular fecha de vencimiento
    const start = new Date(start_date);
    const end = new Date(start);
    if (plan_type === "mensual") end.setMonth(end.getMonth() + 1);
    else if (plan_type === "trimestral") end.setMonth(end.getMonth() + 3);
    else if (plan_type === "anual") end.setFullYear(end.getFullYear() + 1);
    else if (plan_type === "quincenal") end.setDate(end.getDate() + 15);

    // Hash password y crear perfil + membresía en transacción
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          dni,
          fullName: full_name,
          phone: phone || null,
          password: hashedPassword,
          role: "member",
        },
      });

      await tx.membership.create({
        data: {
          userId: profile.id,
          planType: plan_type,
          startDate: start,
          endDate: end,
          status: "active",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
