import { Tabs } from "expo-router";

// Pestanas de la app con sesion. Por ahora solo "Mis grupos"; el resto se agrega despues.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Mis grupos" }} />
    </Tabs>
  );
}
