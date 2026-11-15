import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { ButtonRow } from "@/components/base/ButtonRow";
import { colors, radius, spacing } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { SuggestedPayment } from "@/domain/settle";
import type { Member } from "@/types";

import { memberName } from "./members";

type Props = {
  members: Member[];
  payment: SuggestedPayment;
  onConfirm: () => void;
  onCancel: () => void;
};

// Pide confirmar un pago antes de registrarlo, porque los pagos no se pueden anular.
export function PaymentConfirm({ members, payment, onConfirm, onCancel }: Props) {
  const from = memberName(members, payment.de_uid);
  const to = memberName(members, payment.a_uid);
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <AppText>{`Confirma que ${from} le pago ${formatCop(payment.monto_centavos)} a ${to}`}</AppText>
      <ButtonRow>
        <AppButton label="Confirmar pago" onPress={onConfirm} />
        <AppButton label="Cancelar" variant="ghost" onPress={onCancel} />
      </ButtonRow>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.medium - 4,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.large,
    backgroundColor: colors.primarySoft,
  },
});
