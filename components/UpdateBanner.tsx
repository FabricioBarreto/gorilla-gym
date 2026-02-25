"use client";

// ============================================================
// ARCHIVO: components/UpdateBanner.tsx
// Banner que aparece automáticamente cuando hay una nueva versión
// Agregar en app/layout.tsx dentro del <body>
// ============================================================

import { useEffect, useState } from "react";

export function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [worker, setWorker] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Verificar actualizaciones periódicamente
      const interval = setInterval(() => reg.update(), 60 * 1000);

      // Cuando hay un SW nuevo esperando → mostrar banner
      const checkWaiting = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setWorker(reg.waiting);
          setShowBanner(true);
        }
      };

      checkWaiting(reg);

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWorker(newWorker);
            setShowBanner(true);
          }
        });
      });

      return () => clearInterval(interval);
    });

    // Recargar cuando el SW nuevo toma control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (!worker) return;
    setUpdating(true);
    worker.postMessage("SKIP_WAITING");
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-gray-800 border border-green-500/30 rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-green-400"
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
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              Nueva version disponible
            </p>
            <p className="text-gray-400 text-xs">
              Actualizate para ver los ultimos cambios
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Ignorar
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {updating ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
