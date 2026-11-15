import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

import { colors, fontSize } from "./theme";

type Variant =
  "display" | "title" | "heading" | "body" | "muted" | "caption" | "error" | "success" | "accent";

type Props = { children: ReactNode; variant?: Variant; center?: boolean };

const HEADERS: Variant[] = ["display", "title", "heading"];

// Texto de la app. Los titulos se anuncian como encabezado para los lectores de pantalla.
export function AppText({ children, variant = "body", center = false }: Props) {
  return (
    <Text
      accessibilityRole={HEADERS.includes(variant) ? "header" : undefined}
      style={[styles[variant], center && styles.center]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, fontWeight: "700", color: colors.text, letterSpacing: 1 },
  title: { fontSize: fontSize.title, fontWeight: "700", color: colors.text },
  heading: { fontSize: fontSize.heading, fontWeight: "600", color: colors.text },
  body: { fontSize: fontSize.body, color: colors.text, lineHeight: 22 },
  muted: { fontSize: fontSize.small, color: colors.muted, lineHeight: 20 },
  caption: { fontSize: fontSize.caption, color: colors.muted, fontWeight: "600" },
  error: { fontSize: fontSize.small, color: colors.error, lineHeight: 20 },
  success: { fontSize: fontSize.body, color: colors.success, lineHeight: 22 },
  accent: { fontSize: fontSize.body, color: colors.primary, fontWeight: "600", lineHeight: 22 },
  center: { textAlign: "center" },
});
