"use client";

import { useEffect, useState } from "react";

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

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
    if (!prompt) return; // Si no hay prompt (Safari/iOS), no mostrar nada
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      setInstalled(true);
    }
  };

  // No mostrar el botón si ya está instalada O si el navegador no soporta instalación
  if (installed || !prompt) return null;

  return (
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
  );
}
