import { useRouter } from "expo-router";
import { useState } from "react";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { TextField } from "@/components/base/TextField";
import { useSession } from "@/providers/SessionProvider";
import { createGroup, validateGroupForm } from "@/services/groupsService";

export default function NuevoGrupo() {
  const router = useRouter();
  const { user } = useSession();
  const [nombre, setNombre] = useState("");
  // Nombre visible por defecto: la parte del correo antes de la @.
  const [miNombre, setMiNombre] = useState(user ? (user.email.split("@")[0] ?? "") : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);

  async function handleCreate() {
    const problem = validateGroupForm(nombre, miNombre);
    setError(problem);
    if (problem) {
      return;
    }
    setBusy(true);
    try {
      const group = await createGroup(nombre, miNombre);
      setCodigo(group.codigo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrio un error");
    } finally {
      setBusy(false);
    }
  }

  // Cuando el grupo ya se creo se muestra el codigo para compartirlo.
  if (codigo) {
    return (
      <Screen>
        <AppText variant="title">Grupo creado</AppText>
        <AppText>Comparte este codigo con tus amigos:</AppText>
        <AppText variant="title">{codigo}</AppText>
        <AppButton label="Listo" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <TextField label="Nombre del grupo" value={nombre} onChangeText={setNombre} maxLength={40} />
      <TextField label="Tu nombre" value={miNombre} onChangeText={setMiNombre} maxLength={30} />
      {error ? <AppText variant="error">{error}</AppText> : null}
      <AppButton label="Crear grupo" onPress={handleCreate} disabled={busy} />
    </Screen>
  );
}
