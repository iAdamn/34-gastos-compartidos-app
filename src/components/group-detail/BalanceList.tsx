import { View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { formatCop } from "@/domain/money";
import type { Shares } from "@/domain/split";
import type { Member } from "@/types";

import { SectionTitle } from "./SectionTitle";

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

export function BalanceList({ members, balances }: { members: Member[]; balances: Shares }) {
  return (
    <View>
      <SectionTitle>Balance</SectionTitle>
      {members.map((member) => (
        <AppText key={member.uid}>{balanceText(member.nombre, balances[member.uid] ?? 0)}</AppText>
      ))}
    </View>
  );
}
