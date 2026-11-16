import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { AppText } from "./AppText";
import { colors, fontSize, radius, spacing } from "./theme";

type Props = Pick<
  TextInputProps,
  | "value"
  | "onChangeText"
  | "secureTextEntry"
  | "keyboardType"
  | "autoCapitalize"
  | "maxLength"
  | "placeholder"
> & { label: string; error?: string | null };

// Campo de texto con etiqueta visible, borde naranja al escribir y mensaje de error debajo.
export function TextField({ label, error, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.focused, error ? styles.inputError : null]}
      />
      {error ? (
        // El lector de pantalla anuncia el error apenas aparece.
        <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite">
          <AppText variant="error">{error}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: fontSize.small, fontWeight: "600", color: colors.muted },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing.medium - 2,
    fontSize: fontSize.body,
    color: colors.text,
  },
  focused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
});
