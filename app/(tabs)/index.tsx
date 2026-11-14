import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { useSession } from "@/providers/SessionProvider";
import { listLocalGroups } from "@/services/groupsService";
import { syncEverything } from "@/services/sync";
import type { LocalGroup } from "@/types";

type Status = "loading" | "ready" | "error";

export default function MisGrupos() {
  const router = useRouter();
  const { signOut } = useSession();
  const [groups, setGroups] = useState<LocalGroup[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [offline, setOffline] = useState(false);

  // Primero muestra lo guardado en SQLite y despues sincroniza y vuelve a leer.
  const load = useCallback(async () => {
    try {
      setGroups(await listLocalGroups());
      setStatus("ready");
      const synced = await syncEverything();
      setOffline(!synced);
      if (synced) {
        setGroups(await listLocalGroups());
      }
    } catch {
      setStatus("error");
    }
  }, []);

  // Se ejecuta cada vez que la pantalla toma el foco, asi un grupo nuevo aparece al volver.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <AppText variant="title">Mis grupos</AppText>
      {offline ? <AppText variant="muted">Sin conexion, mostrando datos guardados</AppText> : null}
      {status === "loading" ? <StateView state="loading" /> : null}
      {status === "error" ? (
        <StateView state="error" message="No se pudieron cargar tus grupos" onRetry={load} />
      ) : null}
      {status === "ready" ? <GroupList groups={groups} /> : null}
      <View style={styles.actions}>
        <AppButton label="Crear grupo" onPress={() => router.push("/grupo/nuevo")} />
        <AppButton
          label="Unirme a un grupo"
          variant="secondary"
          onPress={() => router.push("/unirse")}
        />
        <AppButton label="Cerrar sesion" variant="secondary" onPress={() => signOut()} />
      </View>
    </Screen>
  );
}

function GroupList({ groups }: { groups: LocalGroup[] }) {
  const router = useRouter();
  if (groups.length === 0) {
    return <StateView state="empty" message="Todavia no tienes grupos" />;
  }
  return (
    <FlatList
      data={groups}
      keyExtractor={(group) => group.id}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${item.nombre}`}
          onPress={() => router.push({ pathname: "/grupo/[id]", params: { id: item.id } })}
          style={styles.card}
        >
          <AppText>{item.nombre}</AppText>
          <AppText variant="muted">{`Codigo: ${item.codigo}`}</AppText>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  actions: { gap: 8 },
  card: {
    minHeight: 48,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#6b7280",
  },
});
