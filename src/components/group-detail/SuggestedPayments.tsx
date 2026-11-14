import { View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { formatCop } from "@/domain/money";
import type { SuggestedPayment } from "@/domain/settle";
import type { Member } from "@/types";

import { memberName } from "./members";
import { SectionTitle } from "./SectionTitle";

export function paymentText(members: Member[], payment: SuggestedPayment): string {
  const from = memberName(members, payment.de_uid);
  const to = memberName(members, payment.a_uid);
  return `${from} le paga a ${to} ${formatCop(payment.monto_centavos)}`;
}

type Props = { members: Member[]; suggested: SuggestedPayment[] };

export function SuggestedPayments({ members, suggested }: Props) {
  return (
    <View>
      <SectionTitle>Pagos sugeridos</SectionTitle>
      {suggested.length === 0 ? <AppText variant="muted">Nadie le debe a nadie</AppText> : null}
      {suggested.map((payment) => (
        <AppText key={`${payment.de_uid}-${payment.a_uid}`}>
          {paymentText(members, payment)}
        </AppText>
      ))}
    </View>
  );
}
