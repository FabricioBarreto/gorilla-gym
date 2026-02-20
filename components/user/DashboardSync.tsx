"use client";

import { useEffect, useState } from "react";
import { syncDataToOffline } from "@/lib/sync-manager";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface DashboardSyncProps {
  userId: string;
}

export function DashboardSync({ userId }: DashboardSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Sincronizar automáticamente al cargar si hay internet y no se ha sincronizado
    if (isOnline && !syncing && !synced) {
      setSyncing(true);
      syncDataToOffline(userId)
        .then(() => {
          setSynced(true);
          console.log("✅ Datos sincronizados automáticamente");
        })
        .catch((error) => {
          console.error("❌ Error en sincronización automática:", error);
        })
        .finally(() => {
          setSyncing(false);
        });
    }
  }, [isOnline, userId, syncing, synced]);

  // No mostrar nada (sincronización silenciosa en background)
  return null;
}
