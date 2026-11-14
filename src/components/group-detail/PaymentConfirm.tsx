import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { colors } from "@/components/base/theme";
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
      <AppButton label="Confirmar pago" onPress={onConfirm} />
      <AppButton label="Cancelar" variant="secondary" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
});
