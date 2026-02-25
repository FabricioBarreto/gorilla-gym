"use client";

import { useEffect, useState } from "react";

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

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
    if (!prompt) {
      setShowInstructions(true);
      return;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      setInstalled(true);
    }
  };

  if (installed) return null;

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

      {/* Modal con instrucciones manuales */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">
                Instalar Gorilla GYM
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Seguí estos pasos para instalar la app:
            </p>

            {/* Chrome Android */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-green-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-gray-300 text-sm">
                  Tocá los <strong className="text-white">3 puntos</strong> (⋮)
                  en la esquina superior derecha del navegador
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-gray-300 text-sm">
                  Seleccioná{" "}
                  <strong className="text-white">
                    "Agregar a pantalla de inicio"
                  </strong>{" "}
                  o <strong className="text-white">"Instalar app"</strong>
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-gray-300 text-sm">
                  Tocá <strong className="text-white">"Instalar"</strong> para
                  confirmar
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
