import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
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

type Props = {
  members: Member[];
  suggested: SuggestedPayment[];
  onSelect: (payment: SuggestedPayment) => void;
};

export function SuggestedPayments({ members, suggested, onSelect }: Props) {
  return (
    <View>
      <SectionTitle>Pagos sugeridos</SectionTitle>
      {suggested.length === 0 ? <AppText variant="muted">Nadie le debe a nadie</AppText> : null}
      {suggested.map((payment) => (
        <View key={`${payment.de_uid}-${payment.a_uid}`} style={styles.row}>
          <AppText>{paymentText(members, payment)}</AppText>
          <AppButton
            label="Registrar pago"
            variant="secondary"
            accessibilityLabel={`Registrar pago de ${memberName(members, payment.de_uid)} a ${memberName(members, payment.a_uid)}`}
            onPress={() => onSelect(payment)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4, paddingVertical: 8 },
});
