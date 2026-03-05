// ============================================================
// ARCHIVO: app/api/memberships/route.ts
// POST - Crear/renovar membresía
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId, planType, paymentMethod, currentMembershipId } =
      await req.json();

    const today = new Date();
    const end = new Date(today);

    if (planType === "diario") end.setDate(end.getDate() + 1);
    else if (planType === "semanal") end.setDate(end.getDate() + 7);
    else if (planType === "quincenal") end.setDate(end.getDate() + 15);
    else if (planType === "mensual") end.setMonth(end.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
      if (currentMembershipId) {
        await tx.membership.update({
          where: { id: currentMembershipId },
          data: { status: "expired" },
        });
      }
      await tx.membership.create({
        data: {
          userId,
          planType,
          startDate: today,
          endDate: end,
          status: "active",
          paymentMethod: paymentMethod || null,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
