import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

import { colors } from "./theme";

type Variant = "title" | "body" | "error" | "muted";

type Props = { children: ReactNode; variant?: Variant };

// Texto de la app. El titulo se anuncia como encabezado para los lectores de pantalla.
export function AppText({ children, variant = "body" }: Props) {
  return (
    <Text accessibilityRole={variant === "title" ? "header" : undefined} style={styles[variant]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  error: { fontSize: 14, color: colors.error },
  muted: { fontSize: 14, color: colors.muted },
});
