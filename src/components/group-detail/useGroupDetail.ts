import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { loadGroupDetail, type GroupDetail } from "@/services/groupsService";
import { syncGroupNow } from "@/services/sync";

import { cameBackOnline } from "./connectivity";

export type DetailStatus = "loading" | "ready" | "notFound" | "error";

// Lee el grupo de SQLite y lo sincroniza al abrir la pantalla y cuando vuelve la red.
export function useGroupDetail(gid: string) {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState("");
  // Cada vez que sube, se vuelve a leer SQLite.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Si llega una lectura vieja (por ejemplo de una busqueda anterior) se ignora.
    let current = true;
    loadGroupDetail(gid, search)
      .then((data) => {
        if (current) {
          setDetail(data);
          setStatus(data ? "ready" : "notFound");
        }
      })
      .catch(() => current && setStatus("error"));
    return () => {
      current = false;
    };
  }, [gid, search, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const syncNow = useCallback(async () => {
    const synced = await syncGroupNow(gid);
    setOffline(!synced);
    reload();
  }, [gid, reload]);

  // Al tomar el foco (al abrir o al volver de registrar un gasto) se sincroniza.
  useFocusEffect(
    useCallback(() => {
      syncNow();
    }, [syncNow]),
  );

  useEffect(() => {
    let wasConnected: boolean | null = null;
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (cameBackOnline(wasConnected, state.isConnected)) {
        syncNow();
      }
      wasConnected = state.isConnected;
    });
    // Al salir de la pantalla se deja de escuchar la red.
    return unsubscribe;
  }, [syncNow]);

  return { detail, status, offline, search, setSearch, reload };
}
