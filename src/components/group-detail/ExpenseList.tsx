import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { colors, fontSize, radius, spacing } from "@/components/base/theme";
import { formatCop } from "@/domain/money";
import type { LocalExpense, Member } from "@/types";

import { memberName } from "./members";
import { SwipeToDelete } from "./SwipeToDelete";

type Props = {
  expenses: LocalExpense[];
  members: Member[];
  searching: boolean;
  canDeleteExpense: (expense: LocalExpense) => boolean;
  onDelete: (expense: LocalExpense) => void;
  // Lo que va arriba de la lista dentro de la tarjeta, por ejemplo el buscador.
  header?: ReactNode;
};

export function ExpenseList({ expenses, searching, header, ...rowProps }: Props) {
  const emptyText = searching ? "Ningun gasto coincide con la busqueda" : "Todavia no hay gastos";
  return (
    <Card title="Gastos">
      {header}
      {expenses.length === 0 ? <AppText variant="muted">{emptyText}</AppText> : null}
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} {...rowProps} />
      ))}
    </Card>
  );
}

type RowProps = Omit<Props, "expenses" | "searching" | "header"> & { expense: LocalExpense };

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
        <View style={styles.info}>
          <AppText variant="heading">{expense.descripcion}</AppText>
          <AppText variant="muted">{`${formatCop(expense.monto_centavos)} · pago ${payer}`}</AppText>
          {expense.pending ? <Text style={styles.pending}>Pendiente de envio</Text> : null}
        </View>
        {/* Alternativa al gesto para quien usa lector de pantalla o no puede deslizar. */}
        {deletable ? (
          <AppButton
            label="Eliminar"
            variant="danger"
            compact
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
    padding: spacing.medium - 4,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceRaised,
  },
  info: { flex: 1, gap: 2 },
  pending: {
    alignSelf: "flex-start",
    marginTop: spacing.xsmall,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    fontSize: fontSize.caption,
    fontWeight: "600",
    overflow: "hidden",
  },
});
