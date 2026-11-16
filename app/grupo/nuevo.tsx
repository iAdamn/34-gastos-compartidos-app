import { useRouter } from "expo-router";
import { useState } from "react";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { Notice } from "@/components/base/Notice";
import { Screen } from "@/components/base/Screen";
import { TextField } from "@/components/base/TextField";
import { GroupQr } from "@/components/qr/GroupQr";
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
    return <GroupCreated codigo={codigo} onDone={() => router.back()} />;
  }

  return (
    <Screen header scroll>
      <Card>
        <AppText variant="muted">
          Crea el grupo y comparte el codigo para que tus amigos se unan.
        </AppText>
        <TextField
          label="Nombre del grupo"
          value={nombre}
          onChangeText={setNombre}
          maxLength={40}
          placeholder="Viaje a Cartagena"
        />
        <TextField label="Tu nombre" value={miNombre} onChangeText={setMiNombre} maxLength={30} />
        {error ? <Notice tone="error">{error}</Notice> : null}
      </Card>
      <AppButton label="Crear grupo" onPress={handleCreate} disabled={busy} />
    </Screen>
  );
}

// Cuando el grupo ya se creo se muestra el codigo grande para compartirlo.
function GroupCreated({ codigo, onDone }: { codigo: string; onDone: () => void }) {
  return (
    <Screen header scroll>
      <Card>
        <AppText variant="title" center>
          Grupo creado
        </AppText>
        <AppText variant="muted" center>
          Comparte este codigo con tus amigos:
        </AppText>
        <AppText variant="display" center>
          {codigo}
        </AppText>
        <GroupQr codigo={codigo} />
        <AppText variant="muted" center>
          Tambien pueden escanear este QR desde la opcion Unirme a un grupo.
        </AppText>
      </Card>
      <AppButton label="Listo" onPress={onDone} />
    </Screen>
  );
}
