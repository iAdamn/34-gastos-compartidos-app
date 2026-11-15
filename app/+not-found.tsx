import { Redirect, useRouter } from "expo-router";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { useSession } from "@/providers/SessionProvider";

// Ruta que no existe o que no se puede ver sin sesion.
// Sin sesion la raiz "/" (Mis grupos) esta protegida y cae aqui: se manda al login.
export default function NotFound() {
  const { user } = useSession();
  const router = useRouter();
  if (!user) {
    return <Redirect href="/login" />;
  }
  return (
    <Screen>
      <AppText variant="title">Pantalla no encontrada</AppText>
      <AppButton label="Ir a mis grupos" onPress={() => router.replace("/")} />
    </Screen>
  );
}
