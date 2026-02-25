// ============================================================
// ARCHIVO: app/api/admins/route.ts
// POST - Crear nuevo administrador
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
    const { full_name, dni, password } = body;

    if (!full_name?.trim()) {
      return NextResponse.json(
        { error: "El nombre completo es requerido" },
        { status: 400 },
      );
    }
    if (!/^\d{7,8}$/.test(dni)) {
      return NextResponse.json(
        { error: "El DNI debe tener 7 u 8 dígitos" },
        { status: 400 },
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    const existing = await prisma.profile.findUnique({ where: { dni } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este DNI" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.profile.create({
      data: {
        dni,
        fullName: full_name.trim(),
        password: hashedPassword,
        role: "admin",
        phone: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
