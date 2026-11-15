import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { StateView } from "@/components/base/StateView";
import { colors } from "@/components/base/theme";
import { SessionProvider, useSession } from "@/providers/SessionProvider";

// Rutas protegidas: sin sesion solo existe (auth); con sesion existen las demas.
function Routes() {
  const { user, loading } = useSession();
  if (loading) {
    return <StateView state="loading" />;
  }
  return (
    // Barra de titulo oscura, sin sombra, con el boton de volver en naranja.
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
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
      <StatusBar style="light" />
      <SessionProvider>
        <Routes />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
