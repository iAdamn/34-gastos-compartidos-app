import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing } from "./theme";

type Props = { title?: string; children: ReactNode; raised?: boolean };

// Tarjeta gris para agrupar una seccion de la pantalla. El titulo se anuncia como encabezado.
export function Card({ title, children, raised = false }: Props) {
  return (
    <View style={[styles.card, raised && styles.raised]}>
      {title ? (
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.medium,
    gap: spacing.medium - 4,
  },
  raised: { backgroundColor: colors.surfaceRaised },
  title: { fontSize: fontSize.heading, fontWeight: "600", color: colors.text },
});
