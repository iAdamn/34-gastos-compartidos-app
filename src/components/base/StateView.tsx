import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppButton } from "./AppButton";
import { AppText } from "./AppText";
import { colors, spacing } from "./theme";

type Props = {
  state: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
};

// Los tres estados de una lista: cargando, vacia o con error.
export function StateView({ state, message, onRetry }: Props) {
  if (state === "loading") {
    return (
      <View style={styles.box} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.primary} />
        <AppText variant="muted">{message ?? "Cargando..."}</AppText>
      </View>
    );
  }
  const isError = state === "error";
  return (
    <View style={styles.box}>
      <AppText variant={isError ? "error" : "muted"}>
        {message ?? (isError ? "Ocurrio un error" : "No hay nada por aqui")}
      </AppText>
      {isError && onRetry ? <AppButton label="Reintentar" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.small,
    padding: spacing.large,
  },
});
