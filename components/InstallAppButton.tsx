"use client";

import { useEffect, useState } from "react";

let savedPrompt: any = null;

export function InstallAppButton() {
  const [, forceRender] = useState(0);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      savedPrompt = e;
      forceRender((n) => n + 1);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (savedPrompt) {
      savedPrompt.prompt();
      await savedPrompt.userChoice;
      savedPrompt = null;
    } else {
      // Android sin prompt: instrucciones manuales
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 transition-colors"
      >
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
      </button>

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
                  {isIOS ? "Instalar en iPhone" : "Instalar la app"}
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
              {isIOS ? (
                <>
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
                  <p className="text-yellow-500 text-xs text-center mt-2">
                    ⚠️ Solo funciona desde Safari
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                    <span className="text-2xl flex-shrink-0">1️⃣</span>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Tocá los 3 puntos ⋮
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        En la esquina superior derecha de Chrome
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
                        O "Instalar app"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                    <span className="text-2xl flex-shrink-0">3️⃣</span>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Tocá "Instalar"
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
