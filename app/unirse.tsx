import { useRouter } from "expo-router";
import { useState } from "react";

import { ApiClientError } from "@/api/client";
import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { TextField } from "@/components/base/TextField";
import { QrScanner } from "@/components/qr/QrScanner";
import { useSession } from "@/providers/SessionProvider";
import { joinGroup, validateJoinForm } from "@/services/groupsService";

// La API responde 404 cuando el codigo no existe.
function joinErrorMessage(e: unknown): string {
  if (e instanceof ApiClientError && e.status === 404) {
    return "Grupo no encontrado";
  }
  return e instanceof Error ? e.message : "Ocurrio un error";
}

export default function Unirse() {
  const router = useRouter();
  const { user } = useSession();
  const [codigo, setCodigo] = useState("");
  // Nombre visible por defecto: la parte del correo antes de la @.
  const [miNombre, setMiNombre] = useState(user ? (user.email.split("@")[0] ?? "") : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleJoin() {
    const problem = validateJoinForm(codigo, miNombre);
    setError(problem);
    if (problem) {
      return;
    }
    setBusy(true);
    try {
      await joinGroup(codigo, miNombre);
      router.back();
    } catch (e) {
      setError(joinErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <QrScanner onCode={setCodigo} />
      <TextField
        label="Codigo del grupo"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
        maxLength={6}
      />
      <TextField label="Tu nombre" value={miNombre} onChangeText={setMiNombre} maxLength={30} />
      {error ? <AppText variant="error">{error}</AppText> : null}
      <AppButton label="Unirme" onPress={handleJoin} disabled={busy} />
    </Screen>
  );
}
