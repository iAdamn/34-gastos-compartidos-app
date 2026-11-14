import { Stack } from "expo-router";

// Pantallas sin sesion: login y registro.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
