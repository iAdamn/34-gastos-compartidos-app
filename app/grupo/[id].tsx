import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { TextField } from "@/components/base/TextField";
import { BalanceList } from "@/components/group-detail/BalanceList";
import { ExpenseList } from "@/components/group-detail/ExpenseList";
import { PaymentsSection } from "@/components/group-detail/PaymentsSection";
import { useGroupActions } from "@/components/group-detail/useGroupActions";
import { useGroupDetail } from "@/components/group-detail/useGroupDetail";

export default function Grupo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { detail, status, offline, search, setSearch, reload } = useGroupDetail(id);
  const actions = useGroupActions(id, reload);

  if (status === "loading") {
    return <StateView state="loading" />;
  }
  if (status === "notFound") {
    return <StateView state="error" message="Grupo no encontrado" />;
  }
  if (status === "error" || !detail) {
    return <StateView state="error" message="No se pudo cargar el grupo" onRetry={reload} />;
  }
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">{detail.group.nombre}</AppText>
        {offline ? (
          <AppText variant="muted">Sin conexion, mostrando datos guardados</AppText>
        ) : null}
        {actions.message ? <AppText>{actions.message}</AppText> : null}
        {actions.error ? <AppText variant="error">{actions.error}</AppText> : null}
        <AppButton
          label="Registrar gasto"
          onPress={() => router.push({ pathname: "/gasto/nuevo", params: { gid: id } })}
        />
        <BalanceList members={detail.members} balances={detail.balances} />
        <PaymentsSection
          members={detail.members}
          suggested={detail.suggested}
          selected={actions.selected}
          onSelect={actions.selectPayment}
          onConfirm={actions.confirmPayment}
          onCancel={actions.cancelPayment}
        />
        <TextField label="Buscar gasto" value={search} onChangeText={setSearch} />
        <ExpenseList
          expenses={detail.expenses}
          members={detail.members}
          searching={!!search}
          canDeleteExpense={actions.canDeleteExpense}
          onDelete={actions.removeExpense}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
});
