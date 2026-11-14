import { StyleSheet, Text } from "react-native";

import { colors } from "@/components/base/theme";

// Titulo de una seccion de la pantalla. Se anuncia como encabezado.
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 8 },
});
