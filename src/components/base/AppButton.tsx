import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSize, radius } from "./theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: Variant;
  compact?: boolean;
  disabled?: boolean;
};

// Boton accesible: rol de boton, etiqueta para el lector de pantalla y area de toque de 48 de alto
// (44 en la version compacta). Al presionarlo cambia de tono para que se note el toque.
export function AppButton({
  label,
  onPress,
  accessibilityLabel,
  variant = "primary",
  compact = false,
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        styles[variant],
        pressed && pressedStyles[variant],
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText, textStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.medium,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  compact: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1, borderColor: colors.primary, backgroundColor: "transparent" },
  ghost: { backgroundColor: "transparent" },
  danger: { borderWidth: 1, borderColor: colors.error, backgroundColor: "transparent" },
  disabled: { opacity: 0.45 },
  text: { fontSize: fontSize.body, fontWeight: "600" },
  compactText: { fontSize: fontSize.small },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: colors.surfaceRaised },
  danger: { backgroundColor: colors.errorSoft },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.onPrimary },
  secondary: { color: colors.primary },
  ghost: { color: colors.muted },
  danger: { color: colors.error },
});
