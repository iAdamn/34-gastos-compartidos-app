import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { StateView } from "@/components/base/StateView";
import { SessionProvider, useSession } from "@/providers/SessionProvider";

// Rutas protegidas: sin sesion solo existe (auth); con sesion existen las demas.
function Routes() {
  const { user, loading } = useSession();
  if (loading) {
    return <StateView state="loading" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="grupo/nuevo" options={{ headerShown: true, title: "Nuevo grupo" }} />
        <Stack.Screen name="unirse" options={{ headerShown: true, title: "Unirse a un grupo" }} />
        <Stack.Screen name="grupo/[id]" options={{ headerShown: true, title: "Grupo" }} />
        <Stack.Screen
          name="gasto/nuevo"
          options={{ headerShown: true, title: "Registrar gasto" }}
        />
      </Stack.Protected>
    </Stack>
  );
}

// Layout raiz. GestureHandlerRootView hace falta para que funcionen los gestos.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SessionProvider>
        <Routes />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
