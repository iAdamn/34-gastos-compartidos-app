import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { colors } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { LocalExpense, Member } from "@/types";

import { memberName } from "./members";
import { SectionTitle } from "./SectionTitle";

type Props = { expenses: LocalExpense[]; members: Member[]; searching: boolean };

export function ExpenseList({ expenses, members, searching }: Props) {
  const emptyText = searching ? "Ningun gasto coincide con la busqueda" : "Todavia no hay gastos";
  return (
    <View>
      <SectionTitle>Gastos</SectionTitle>
      {expenses.length === 0 ? <AppText variant="muted">{emptyText}</AppText> : null}
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} members={members} />
      ))}
    </View>
  );
}

function ExpenseRow({ expense, members }: { expense: LocalExpense; members: Member[] }) {
  const payer = memberName(members, expense.pagador_uid);
  return (
    <View style={styles.row}>
      <AppText>{expense.descripcion}</AppText>
      <AppText variant="muted">{`${formatCop(expense.monto_centavos)} · pago ${payer}`}</AppText>
      {expense.pending ? <AppText variant="muted">Pendiente de envio</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
