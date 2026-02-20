"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir DNI a email interno
      const email = `${dni}@gorilagym.local`; // ← Cambiar a minúscula

      console.log("🔍 Intentando login con:", { dni, email }); // ← DEBUG

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("🔍 Respuesta de Supabase:", { data, error }); // ← DEBUG

      if (error) {
        if (error.message.includes("Invalid")) {
          throw new Error("DNI o contraseña incorrectos");
        }
        throw error;
      }

      // Obtener el rol del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, dni")
        .eq("id", data.user.id)
        .single();

      console.log("🔍 Perfil obtenido:", profile); // ← DEBUG

      // Verificar que el DNI coincida
      if (profile?.dni !== dni) {
        await supabase.auth.signOut();
        throw new Error("Error de autenticación");
      }

      console.log(
        "🔍 Redirigiendo a:",
        profile?.role === "admin" ? "/admin" : "/dashboard",
      ); // ← DEBUG

      // Redirigir según el rol
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err: any) {
      console.error("❌ Error en login:", err); // ← DEBUG
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🦍 Gorilla GYM</h1>
          <p className="text-gray-400">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                DNI
              </label>
              <input
                id="dni"
                type="text"
                required
                pattern="\d{7,8}"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="12345678"
              />
              <p className="text-gray-400 text-xs mt-1">
                Sin puntos ni espacios
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            ¿Olvidaste tu contraseña? Contacta con el gimnasio
          </p>
        </div>
      </div>
    </div>
  );
}
