"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OfflineIndicator } from "./OfflineIndicator";
import { UpdateAppButton } from "@/components/UpdateAppButton";
import { InstallAppButton } from "@/components/InstallAppButton";

interface UserNavProps {
  userName: string;
}

export function UserNav({ userName }: UserNavProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
              <span className="text-xl font-bold text-white">Gorilla GYM</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/exercises"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Ejercicios
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400">Usuario</p>
              </div>
              <InstallAppButton />
              <Link
                href="/dashboard/profile"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Mi Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Salir
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-md"
              aria-label="Abrir menu"
            >
              {menuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/exercises"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Ejercicios
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Mi Perfil
              </Link>
            </div>
            <div className="border-t border-gray-700 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400">Usuario</p>
              </div>
              <div className="flex items-center space-x-2">
                <InstallAppButton />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <OfflineIndicator />
    </>
  );
}
