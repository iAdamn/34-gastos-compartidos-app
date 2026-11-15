import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, useLongPressGesture } from "react-native-gesture-handler";

import { AppText } from "@/components/base/AppText";
import { colors, radius, spacing } from "@/components/base/theme";
import type { Member } from "@/types";

type Props = { member: Member; checked: boolean; onToggle: () => void };

// Gesto 2: mantener presionado el nombre de un miembro lo marca o desmarca como participante.
// La casilla de la derecha hace lo mismo con un toque y la puede usar un lector de pantalla.
export function ParticipantRow({ member, checked, onToggle }: Props) {
  const longPress = useLongPressGesture({
    testID: `mantener-${member.uid}`,
    minDuration: 400,
    runOnJS: true,
    onActivate: onToggle,
  });
  return (
    <View style={styles.row}>
      <GestureDetector gesture={longPress}>
        <View style={styles.name}>
          <AppText>{member.nombre}</AppText>
        </View>
      </GestureDetector>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Participa ${member.nombre}`}
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={[styles.box, checked && styles.boxChecked]}
      >
        <Text style={styles.mark}>{checked ? "✓" : ""}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
    paddingLeft: spacing.medium - 4,
    paddingRight: spacing.xsmall,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceRaised,
  },
  name: { flex: 1, minHeight: 52, justifyContent: "center" },
  box: {
    width: 44,
    height: 44,
    margin: spacing.xsmall,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: colors.primary },
  mark: { fontSize: 22, fontWeight: "800", color: colors.onPrimary },
});
