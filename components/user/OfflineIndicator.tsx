"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect, useState } from "react";
import { getLastSync } from "@/lib/offline-storage";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    getLastSync().then(setLastSync);
  }, [isOnline]);

  if (isOnline) return null;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm z-50">
      <div className="flex items-start space-x-3">
        <span className="text-2xl">📡</span>
        <div className="flex-1">
          <h3 className="text-yellow-400 font-bold text-sm mb-1">
            Modo Offline
          </h3>
          <p className="text-yellow-300 text-xs mb-2">
            Sin conexión a internet. Usando datos guardados.
          </p>
          {lastSync && (
            <p className="text-yellow-400/70 text-xs">
              Última sincronización: {formatDate(lastSync)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
