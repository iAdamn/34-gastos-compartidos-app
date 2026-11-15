import { Stack } from "expo-router";

import { colors } from "@/components/base/theme";

// Pantallas sin sesion: login y registro.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
