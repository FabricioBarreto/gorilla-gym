// ============================================================
// ARCHIVO: app/api/exercises/[id]/images/route.ts
// POST - Agregar imágenes | PUT - Reordenar imágenes
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const { image_urls } = await req.json();

    // Obtener último order_index
    const last = await prisma.exerciseImage.findFirst({
      where: { exerciseId: id },
      orderBy: { orderIndex: "desc" },
    });
    const lastIndex = last?.orderIndex ?? -1;

    await prisma.exerciseImage.createMany({
      data: image_urls.map((url: string, i: number) => ({
        exerciseId: id,
        imageUrl: url,
        orderIndex: lastIndex + i + 1,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { order } = await req.json();
    // order: [{ id: string, orderIndex: number }]

    await Promise.all(
      order.map(({ id, orderIndex }: { id: string; orderIndex: number }) =>
        prisma.exerciseImage.update({
          where: { id },
          data: { orderIndex },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
