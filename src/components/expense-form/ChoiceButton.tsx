import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSize, radius } from "@/components/base/theme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

// Opcion de una lista donde solo se elige una (quien pago, modo de reparto). La elegida va en naranja.
export function ChoiceButton({ label, selected, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.selected,
        pressed && !selected && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: 44,
    minWidth: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { borderColor: colors.primary },
  text: { fontSize: fontSize.body, color: colors.text, fontWeight: "500" },
  selectedText: { color: colors.onPrimary, fontWeight: "700" },
});
