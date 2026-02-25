import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ??
    "gorilla-gym-super-secret-key-change-in-production-2026",
);

export async function POST(request: NextRequest) {
  try {
    const { dni, password } = await request.json();

    if (!dni || !password) {
      return NextResponse.json(
        { error: "DNI y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const user = await prisma.profile.findUnique({
      where: { dni },
    });

    if (!user) {
      return NextResponse.json(
        { error: "DNI o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "DNI o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const token = await new SignJWT({
      id: user.id,
      dni: user.dni,
      role: user.role,
      name: user.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      user: {
        id: user.id,
        dni: user.dni,
        role: user.role,
        name: user.fullName,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
