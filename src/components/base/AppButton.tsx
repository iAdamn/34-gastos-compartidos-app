import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "./theme";

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

// Boton accesible: rol de boton, etiqueta para el lector de pantalla y area de toque de 48 de alto.
export function AppButton({
  label,
  onPress,
  accessibilityLabel,
  variant = "primary",
  disabled = false,
}: Props) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        primary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, primary ? styles.onPrimary : styles.onSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: "600" },
  onPrimary: { color: colors.onPrimary },
  onSecondary: { color: colors.primary },
});
