import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { ButtonRow } from "@/components/base/ButtonRow";
import { Notice } from "@/components/base/Notice";
import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { colors, radius, spacing } from "@/components/base/theme";
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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="caption">GASTOS COMPARTIDOS</AppText>
          <AppText variant="title">Mis grupos</AppText>
        </View>
        <AppButton label="Cerrar sesion" variant="ghost" compact onPress={() => signOut()} />
      </View>
      {offline ? <Notice tone="warning">Sin conexion, mostrando datos guardados</Notice> : null}
      {status === "loading" ? <StateView state="loading" /> : null}
      {status === "error" ? (
        <StateView state="error" message="No se pudieron cargar tus grupos" onRetry={load} />
      ) : null}
      {status === "ready" ? <GroupList groups={groups} /> : null}
      <ButtonRow>
        <AppButton label="Crear grupo" onPress={() => router.push("/grupo/nuevo")} />
        <AppButton
          label="Unirme a un grupo"
          variant="secondary"
          onPress={() => router.push("/unirse")}
        />
      </ButtonRow>
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
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyExtractor={(group) => group.id}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${item.nombre}`}
          onPress={() => router.push({ pathname: "/grupo/[id]", params: { id: item.id } })}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View style={styles.initial}>
            <Text style={styles.initialText}>{item.nombre.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.cardText}>
            <AppText variant="heading">{item.nombre}</AppText>
            <AppText variant="muted">{`Codigo: ${item.codigo}`}</AppText>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.small },
  headerText: { flex: 1, gap: 2 },
  list: { flex: 1 },
  listContent: { gap: spacing.small + 2, paddingBottom: spacing.small },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.medium - 4,
    minHeight: 72,
    padding: spacing.medium - 2,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardPressed: { backgroundColor: colors.surfaceRaised },
  initial: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: { fontSize: 20, fontWeight: "700", color: colors.primary },
  cardText: { flex: 1, gap: 2 },
  chevron: { fontSize: 28, color: colors.muted },
});
