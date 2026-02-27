"use client";

import { useEffect, useState } from "react";

// Guardar el prompt GLOBALMENTE para no perderlo entre renders
let globalInstallPrompt: any = null;

export function InstallAppButton() {
  const [ready, setReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(standalone);

    // Si ya tenemos el prompt guardado globalmente, usarlo
    if (globalInstallPrompt) {
      setReady(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      globalInstallPrompt = e;
      setReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      globalInstallPrompt = null;
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleClick = async () => {
    // Ya instalada → recargar para actualizar
    if (isInstalled) {
      window.location.reload();
      return;
    }

    // iOS → mostrar instrucciones
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // Android con prompt → instalar directo
    if (globalInstallPrompt) {
      globalInstallPrompt.prompt();
      const { outcome } = await globalInstallPrompt.userChoice;
      if (outcome === "accepted") {
        globalInstallPrompt = null;
        setReady(false);
        setIsInstalled(true);
      }
      return;
    }

    // Android sin prompt (no debería pasar, pero por si acaso)
    setShowIOSModal(true);
  };

  // No mostrar en Android si no hay prompt y no está instalada
  if (!isIOS && !isInstalled && !ready) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isInstalled
            ? "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30"
            : "bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30"
        }`}
      >
        {isInstalled ? (
          <>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Actualizar</span>
          </>
        ) : (
          <>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Instalar app</span>
          </>
        )}
      </button>

      {/* Modal solo para iOS */}
      {showIOSModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <img
                  src="/android/android-launchericon-48-48.png"
                  className="w-10 h-10 rounded-xl"
                  alt="Gorilla GYM"
                />
                <h3 className="text-white font-bold text-lg">
                  Instalar en iPhone
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                <span className="text-2xl flex-shrink-0">1️⃣</span>
                <div>
                  <p className="text-white text-sm font-medium">
                    Tocá el botón compartir{" "}
                    <span className="text-blue-400">□↑</span>
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    En la barra inferior de Safari
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                <span className="text-2xl flex-shrink-0">2️⃣</span>
                <div>
                  <p className="text-white text-sm font-medium">
                    "Agregar a pantalla de inicio"
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Scrolleá hacia abajo en el menú
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                <span className="text-2xl flex-shrink-0">3️⃣</span>
                <div>
                  <p className="text-white text-sm font-medium">
                    Tocá "Agregar"
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    La app aparece en tu pantalla de inicio
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-xs text-center mt-2">
                ⚠️ Solo funciona desde Safari
              </p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
