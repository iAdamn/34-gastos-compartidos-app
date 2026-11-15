import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { colors, radius, spacing } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { SuggestedPayment } from "@/domain/settle";
import type { Member } from "@/types";

import { memberName } from "./members";

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
    <Card title="Pagos sugeridos">
      {suggested.length === 0 ? <AppText variant="muted">Nadie le debe a nadie</AppText> : null}
      {suggested.map((payment) => (
        <View key={`${payment.de_uid}-${payment.a_uid}`} style={styles.row}>
          <View style={styles.text}>
            <AppText>{paymentText(members, payment)}</AppText>
          </View>
          <AppButton
            label="Registrar pago"
            variant="secondary"
            compact
            accessibilityLabel={`Registrar pago de ${memberName(members, payment.de_uid)} a ${memberName(members, payment.a_uid)}`}
            onPress={() => onSelect(payment)}
          />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.small,
    padding: spacing.medium - 4,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceRaised,
  },
  text: { flexGrow: 1, flexBasis: 160 },
});
