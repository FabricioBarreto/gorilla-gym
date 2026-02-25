"use client";

import { useState } from "react";

export function UpdateAppButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleUpdate = async () => {
    setStatus("loading");
    try {
      // 1. Limpiar todos los caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      // 2. Forzar actualización del Service Worker
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          reg.waiting?.postMessage("SKIP_WAITING");
        }
      }

      setStatus("done");
      // Recargar después de 1 segundo
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Error al actualizar:", err);
      // Recargar igual
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={status === "loading"}
      title="Descargar última versión"
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        status === "done"
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : status === "loading"
            ? "bg-gray-700 text-gray-400 border border-gray-600 cursor-wait"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
      }`}
    >
      {status === "loading" ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Actualizando...</span>
        </>
      ) : status === "done" ? (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Actualizado</span>
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Actualizar app</span>
        </>
      )}
    </button>
  );
}
