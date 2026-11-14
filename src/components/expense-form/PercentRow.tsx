import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";

type Props = { nombre: string; percent: number; onChange: (delta: number) => void; step: number };

// Porcentaje de un participante con botones para bajarlo y subirlo.
export function PercentRow({ nombre, percent, onChange, step }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <AppText>{`${nombre}: ${percent} %`}</AppText>
      </View>
      <AppButton
        label="-"
        variant="secondary"
        accessibilityLabel={`Bajar porcentaje de ${nombre}`}
        onPress={() => onChange(-step)}
      />
      <AppButton
        label="+"
        variant="secondary"
        accessibilityLabel={`Subir porcentaje de ${nombre}`}
        onPress={() => onChange(step)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { flex: 1 },
});
