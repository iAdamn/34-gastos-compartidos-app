import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { Notice } from "@/components/base/Notice";
import { Screen } from "@/components/base/Screen";
import { TextField } from "@/components/base/TextField";
import { colors, radius, spacing } from "@/components/base/theme";
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
    <Screen scroll>
      <Brand />
      <Card title={title}>
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tu@correo.com"
        />
        <TextField
          label="Contrasena"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Minimo 8 caracteres"
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <AppButton label={submitLabel} onPress={handleSubmit} disabled={busy} />
      </Card>
      <AppButton label={otherLabel} onPress={onOther} variant="ghost" />
    </Screen>
  );
}

// Nombre de la app y para que sirve, arriba del formulario.
function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.logo} accessible={false}>
        <Text style={styles.logoText}>$</Text>
      </View>
      <AppText variant="title" center>
        Gastos compartidos
      </AppText>
      <AppText variant="muted" center>
        Registra los gastos del grupo y salda cuentas con la menor cantidad de pagos.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", gap: spacing.small, paddingTop: spacing.xlarge },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.large,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.small,
  },
  logoText: { fontSize: 34, fontWeight: "800", color: colors.onPrimary },
});
