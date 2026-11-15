import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { colors, maxContentWidth, spacing } from "./theme";

type Props = {
  children: ReactNode;
  // Con desplazamiento para formularios y pantallas largas.
  scroll?: boolean;
  // La pantalla tiene barra de titulo: la barra ya respeta la zona segura de arriba.
  header?: boolean;
};

const ALL_EDGES: Edge[] = ["top", "bottom", "left", "right"];
const BELOW_HEADER: Edge[] = ["bottom", "left", "right"];

// Contenedor de toda pantalla: fondo, zonas seguras, margen y ancho maximo en tabletas.
export function Screen({ children, scroll = false, header = false }: Props) {
  const edges = header ? BELOW_HEADER : ALL_EDGES;
  if (scroll) {
    return (
      <SafeAreaView style={styles.screen} edges={edges}>
        <ScrollView
          contentContainerStyle={[styles.content, styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      <View style={[styles.content, styles.fill]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: maxContentWidth,
    alignSelf: "center",
    padding: spacing.medium,
    gap: spacing.medium,
  },
  scrollContent: { paddingBottom: spacing.xlarge },
  fill: { flex: 1 },
});
