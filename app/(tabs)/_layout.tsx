import { Tabs } from "expo-router";

import { colors } from "@/components/base/theme";

// Pestanas de la app con sesion. Hay una sola ("Mis grupos"), asi que la barra de abajo se oculta.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Mis grupos" }} />
    </Tabs>
  );
}
