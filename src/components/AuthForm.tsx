import { useState } from "react";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { TextField } from "@/components/base/TextField";
import { validateCredentials } from "@/services/authService";

type Props = {
  title: string;
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  otherLabel: string;
  onOther: () => void;
};

// Formulario que comparten login y registro: correo, contrasena, error y un boton para cambiar de pantalla.
export function AuthForm({ title, submitLabel, onSubmit, otherLabel, onOther }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    const problem = validateCredentials(email, password);
    setError(problem);
    if (problem) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(email, password);
    } catch (e) {
      // El mensaje viene de la API, por ejemplo "Correo o contrasena incorrectos".
      setError(e instanceof Error ? e.message : "Ocurrio un error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">{title}</AppText>
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextField label="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <AppText variant="error">{error}</AppText> : null}
      <AppButton label={submitLabel} onPress={handleSubmit} disabled={busy} />
      <AppButton label={otherLabel} onPress={onOther} variant="secondary" />
    </Screen>
  );
}
