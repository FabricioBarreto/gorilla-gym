// ============================================================
// ARCHIVO: app/api/prices/route.ts
// PUT - Actualizar precios de membresías
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prices } = await req.json();
    // prices: { mensual: 15000, trimestral: 40000, ... }

    await Promise.all(
      Object.entries(prices).map(([planType, price]) =>
        prisma.membershipPrice.upsert({
          where: { planType },
          update: { price: price as number, updatedBy: session.id },
          create: { planType, price: price as number, updatedBy: session.id },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
