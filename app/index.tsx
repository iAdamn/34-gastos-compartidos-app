import { StyleSheet, Text, View } from "react-native";

// Pantalla inicial provisional. Las pantallas reales llegan en los pasos siguientes del plan.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Gastos compartidos
      </Text>
      <Text>Todavia no hay grupos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
});
