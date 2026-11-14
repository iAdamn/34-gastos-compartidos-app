import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "./theme";

// Contenedor de toda pantalla: respeta las zonas seguras y pone el margen.
export function Screen({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
    gap: spacing.medium,
  },
});
