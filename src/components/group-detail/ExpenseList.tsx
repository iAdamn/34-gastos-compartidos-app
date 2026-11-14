import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { colors } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { LocalExpense, Member } from "@/types";

import { memberName } from "./members";
import { SectionTitle } from "./SectionTitle";
import { SwipeToDelete } from "./SwipeToDelete";

type Props = {
  expenses: LocalExpense[];
  members: Member[];
  searching: boolean;
  canDeleteExpense: (expense: LocalExpense) => boolean;
  onDelete: (expense: LocalExpense) => void;
};

export function ExpenseList({ expenses, searching, ...rowProps }: Props) {
  const emptyText = searching ? "Ningun gasto coincide con la busqueda" : "Todavia no hay gastos";
  return (
    <View>
      <SectionTitle>Gastos</SectionTitle>
      {expenses.length === 0 ? <AppText variant="muted">{emptyText}</AppText> : null}
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} {...rowProps} />
      ))}
    </View>
  );
}

type RowProps = Omit<Props, "expenses" | "searching"> & { expense: LocalExpense };

function ExpenseRow({ expense, members, canDeleteExpense, onDelete }: RowProps) {
  const payer = memberName(members, expense.pagador_uid);
  const deletable = canDeleteExpense(expense);
  return (
    <SwipeToDelete
      enabled={deletable}
      onDelete={() => onDelete(expense)}
      testID={`deslizar-${expense.id}`}
    >
      <View style={styles.row}>
        <AppText>{expense.descripcion}</AppText>
        <AppText variant="muted">{`${formatCop(expense.monto_centavos)} · pago ${payer}`}</AppText>
        {expense.pending ? <AppText variant="muted">Pendiente de envio</AppText> : null}
        {/* Alternativa al gesto para quien usa lector de pantalla o no puede deslizar. */}
        {deletable ? (
          <AppButton
            label="Eliminar"
            variant="secondary"
            accessibilityLabel={`Eliminar gasto ${expense.descripcion}`}
            onPress={() => onDelete(expense)}
          />
        ) : null}
      </View>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
