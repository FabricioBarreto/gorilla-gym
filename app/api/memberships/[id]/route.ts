// ============================================================
// ARCHIVO: app/api/memberships/[id]/route.ts
// PATCH - Editar fechas de una membresía existente
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { start_date, end_date } = await req.json();

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "Se requieren fecha de inicio y vencimiento" },
        { status: 400 },
      );
    }

    const start = new Date(start_date + "T12:00:00");
    const end = new Date(end_date + "T12:00:00");

    if (end <= start) {
      return NextResponse.json(
        { error: "La fecha de vencimiento debe ser posterior al inicio" },
        { status: 400 },
      );
    }

    await prisma.membership.update({
      where: { id },
      data: {
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
