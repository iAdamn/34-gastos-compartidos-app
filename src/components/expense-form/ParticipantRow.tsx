import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, useLongPressGesture } from "react-native-gesture-handler";

import { AppText } from "@/components/base/AppText";
import { colors } from "@/components/base/theme";
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
        style={styles.box}
      >
        <Text style={styles.mark}>{checked ? "✓" : ""}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, minHeight: 48, justifyContent: "center" },
  box: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { fontSize: 22, color: colors.primary },
});
