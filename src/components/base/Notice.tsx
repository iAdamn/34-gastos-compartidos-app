import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing } from "./theme";

type Tone = "info" | "warning" | "error";

// Aviso destacado: sin conexion, pago registrado o un error.
export function Notice({ children, tone = "info" }: { children: string; tone?: Tone }) {
  return (
    <View style={[styles.box, boxStyles[tone]]}>
      <Text style={[styles.text, textStyles[tone]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.medium, paddingHorizontal: spacing.medium, paddingVertical: 10 },
  text: { fontSize: fontSize.small, lineHeight: 20, fontWeight: "500" },
});

const boxStyles = StyleSheet.create({
  info: { backgroundColor: colors.primarySoft },
  warning: { backgroundColor: colors.warningSoft },
  error: { backgroundColor: colors.errorSoft },
});

const textStyles = StyleSheet.create({
  info: { color: colors.primary },
  warning: { color: colors.warning },
  error: { color: colors.error },
});
