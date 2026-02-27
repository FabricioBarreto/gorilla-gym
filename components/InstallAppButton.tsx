"use client";

import { useEffect, useState } from "react";

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }

    setIos(isIOS());

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (ios) {
      setShowIOSModal(true);
      return;
    }
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      setInstalled(true);
    }
  };

  if (installed) return null;
  if (!ios && !prompt) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 transition-colors"
        title="Instalar app en tu dispositivo"
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

      {/* Modal instrucciones iOS */}
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
            </div>

            <p className="text-gray-500 text-xs text-center mt-4">
              ⚠️ Solo funciona desde Safari
            </p>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
