import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { colors, spacing } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { Shares } from "@/domain/split";
import type { Member } from "@/types";

// Texto del saldo de un miembro: positivo le deben, negativo debe.
export function balanceText(nombre: string, cents: number): string {
  if (cents > 0) {
    return `${nombre}: le deben ${formatCop(cents)}`;
  }
  if (cents < 0) {
    return `${nombre}: debe ${formatCop(-cents)}`;
  }
  return `${nombre}: esta al dia`;
}

type Tone = { variant: "success" | "accent" | "muted"; dot: string };

// Verde a quien le deben, naranja a quien debe y gris a quien esta al dia.
function tone(cents: number): Tone {
  if (cents > 0) {
    return { variant: "success", dot: colors.success };
  }
  if (cents < 0) {
    return { variant: "accent", dot: colors.primary };
  }
  return { variant: "muted", dot: colors.border };
}

export function BalanceList({ members, balances }: { members: Member[]; balances: Shares }) {
  return (
    <Card title="Balance">
      {members.map((member) => {
        const cents = balances[member.uid] ?? 0;
        const { variant, dot } = tone(cents);
        return (
          <View key={member.uid} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: dot }]} />
            <AppText variant={variant}>{balanceText(member.nombre, cents)}</AppText>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.small + 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
