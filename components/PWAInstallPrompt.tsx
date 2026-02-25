"use client";

import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true); // Mostrar banner automáticamente
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setShow(false);
    if (outcome === "accepted") setPrompt(null);
  };

  if (!show || !prompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-gray-800 border border-green-500/30 rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/android/android-launchericon-48-48.png"
            className="w-10 h-10 rounded-lg"
            alt="icon"
          />
          <div>
            <p className="text-white text-sm font-medium">
              Instalar Gorilla GYM
            </p>
            <p className="text-gray-400 text-xs">
              Accede rapido desde tu pantalla
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
