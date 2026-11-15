import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "@/components/base/AppButton";
import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { TextField } from "@/components/base/TextField";
import { BalanceList } from "@/components/group-detail/BalanceList";
import { ExpenseList } from "@/components/group-detail/ExpenseList";
import { GroupHeader } from "@/components/group-detail/GroupHeader";
import { PaymentsSection } from "@/components/group-detail/PaymentsSection";
import { useGroupActions } from "@/components/group-detail/useGroupActions";
import { useGroupDetail } from "@/components/group-detail/useGroupDetail";
import { Raffle } from "@/components/raffle/Raffle";

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
    <Screen header scroll>
      <GroupHeader
        group={detail.group}
        offline={offline}
        message={actions.message}
        error={actions.error}
      />
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
      <ExpenseList
        header={<SearchField value={search} onChange={setSearch} />}
        expenses={detail.expenses}
        members={detail.members}
        searching={!!search}
        canDeleteExpense={actions.canDeleteExpense}
        onDelete={actions.removeExpense}
      />
      <Raffle members={detail.members} />
    </Screen>
  );
}

// Buscador de gastos por descripcion, arriba de la lista.
function SearchField({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return (
    <TextField
      label="Buscar gasto"
      value={value}
      onChangeText={onChange}
      placeholder="Mercado, taxi..."
    />
  );
}
