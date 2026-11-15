import { Children, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "./theme";

// Pone botones uno al lado del otro y los baja a otra linea cuando no caben (pantallas angostas).
export function ButtonRow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row}>
      {Children.map(children, (child) => (child ? <View style={styles.cell}>{child}</View> : null))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.small },
  cell: { flexGrow: 1, flexBasis: 140 },
});
