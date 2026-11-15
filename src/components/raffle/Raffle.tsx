import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { ButtonRow } from "@/components/base/ButtonRow";
import { Card } from "@/components/base/Card";
import { colors, radius, spacing } from "@/components/base/theme";
import { useShake, type ShakeStatus } from "@/sensors/useShake";
import type { Member } from "@/types";

import { pickRandomMember } from "./pickPayer";

const STATUS_TEXT: Partial<Record<ShakeStatus, string>> = {
  on: "Sacude el telefono para sortear",
  unavailable: "Este telefono no tiene acelerometro. Usa el boton Sortear.",
  denied: "Sin permiso de movimiento. Usa el boton Sortear.",
};

type Props = { members: Member[]; random?: () => number };

// Sortear quien paga la proxima: con el boton o sacudiendo el telefono.
export function Raffle({ members, random = Math.random }: Props) {
  const [winner, setWinner] = useState<string | null>(null);
  // Cuenta los sorteos para que cada uno se note, aunque salga la misma persona.
  const [round, setRound] = useState(0);
  const draw = useCallback(() => {
    setWinner(pickRandomMember(members, random)?.nombre ?? null);
    setRound((current) => current + 1);
  }, [members, random]);
  const shake = useShake(draw);
  const message = STATUS_TEXT[shake.status];

  return (
    <Card title="Quien paga la proxima">
      <AppText variant="muted">
        El acelerometro solo se usa para notar cuando sacudes el telefono
      </AppText>
      <ButtonRow>
        <AppButton label="Sortear" onPress={draw} />
        {shake.status === "on" ? (
          <AppButton label="Desactivar sacudir" variant="secondary" onPress={shake.disable} />
        ) : (
          <AppButton
            label="Activar sacudir para sortear"
            variant="secondary"
            disabled={shake.status === "checking"}
            onPress={shake.enable}
          />
        )}
      </ButtonRow>
      {message ? <AppText variant="muted">{message}</AppText> : null}
      {round > 0 ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <AppText variant="caption">{`Sorteo ${round}`}</AppText>
          <AppText variant="accent">
            {winner ? `Paga la proxima: ${winner}` : "No hay miembros para sortear"}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  result: {
    gap: spacing.xsmall,
    padding: spacing.medium - 4,
    borderRadius: radius.medium,
    backgroundColor: colors.primarySoft,
  },
});
