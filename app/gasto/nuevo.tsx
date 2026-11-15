import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { ExpenseFormView } from "@/components/expense-form/ExpenseFormView";
import { useGroupMembers } from "@/components/expense-form/useGroupMembers";

// Registrar gasto. El grupo llega como parametro gid desde la pantalla del grupo.
export default function NuevoGasto() {
  const { gid } = useLocalSearchParams<{ gid: string }>();
  const { members, failed } = useGroupMembers(gid);

  if (failed) {
    return <StateView state="error" message="No se pudo cargar el grupo" />;
  }
  if (!members) {
    return <StateView state="loading" />;
  }
  return (
    <Screen header scroll>
      <ExpenseFormView gid={gid} members={members} />
    </Screen>
  );
}
