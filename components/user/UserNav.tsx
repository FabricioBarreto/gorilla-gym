"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { OfflineIndicator } from "./OfflineIndicator";

interface UserNavProps {
  userName: string;
}

export function UserNav({ userName }: UserNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🦍</span>
              <span className="text-xl font-bold text-white">Gorila GYM</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                🏠 Dashboard
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400">Usuario</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard/profile"
                  className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  title="Mi perfil"
                >
                  Mi Perfil 👤
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              🏠 Dashboard
            </Link>
            <Link
              href="/dashboard/exercises"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              📚 Ejercicios
            </Link>
            <Link
              href="/dashboard/profile"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              👤 Mi Perfil
            </Link>
          </div>
        </div>
      </nav>
      <OfflineIndicator />
    </>
  );
}
