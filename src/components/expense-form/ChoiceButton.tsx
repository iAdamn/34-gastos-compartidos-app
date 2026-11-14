import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/components/base/theme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

// Opcion de una lista donde solo se elige una (quien pago, modo de reparto).
export function ChoiceButton({ label, selected, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={selected ? styles.selectedText : styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.primary },
  text: { fontSize: 16, color: colors.primary },
  selectedText: { fontSize: 16, color: colors.onPrimary },
});
