import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { AppText } from "./AppText";
import { colors } from "./theme";

type Props = Pick<
  TextInputProps,
  "value" | "onChangeText" | "secureTextEntry" | "keyboardType" | "autoCapitalize" | "maxLength"
> & { label: string; error?: string | null };

// Campo de texto con etiqueta visible y mensaje de error debajo.
export function TextField({ label, error, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <AppText>{label}</AppText>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <AppText variant="error">{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
});
