import { useRouter } from "expo-router";
import { useState } from "react";

import { useSession } from "@/providers/SessionProvider";
import { addExpense, validateExpenseForm, type ExpenseForm } from "@/services/expensesService";
import type { Member } from "@/types";

import { changePercent, evenPercents, toggleParticipant, type Percents } from "./percents";

export type SplitMode = "iguales" | "porcentajes";

// Participantes y modo de reparto. Por defecto participan todos en partes iguales.
function useSplit(members: Member[]) {
  const [participantes, setParticipantes] = useState(() => members.map((member) => member.uid));
  const [mode, setMode] = useState<SplitMode>("iguales");
  // Cuando cambian los participantes o el modo, los porcentajes vuelven a partes iguales.
  const [percents, setPercents] = useState<Percents>({});

  function toggle(uid: string) {
    const next = toggleParticipant(participantes, uid);
    setParticipantes(next);
    setPercents(evenPercents(next));
  }

  function chooseMode(next: SplitMode) {
    setMode(next);
    setPercents(evenPercents(participantes));
  }

  const changeOne = (uid: string, delta: number) =>
    setPercents((current) => changePercent(current, uid, delta));

  return { participantes, toggle, mode, chooseMode, percents, changeOne };
}

// Estado del formulario de gasto. Por defecto pago quien tiene la sesion.
export function useExpenseForm(gid: string, members: Member[]) {
  const router = useRouter();
  const uid = useSession().user?.id ?? "";
  const [descripcion, setDescripcion] = useState("");
  const [pesos, setPesos] = useState("");
  const [pagador, setPagador] = useState(uid);
  const split = useSplit(members);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const form: ExpenseForm = {
      descripcion,
      pesos,
      pagador_uid: pagador,
      participantes: split.participantes,
      porcentajes: split.mode === "porcentajes" ? split.percents : null,
    };
    const problem = validateExpenseForm(form);
    setError(problem);
    if (problem) {
      return;
    }
    setBusy(true);
    try {
      await addExpense(gid, uid, form);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el gasto");
    } finally {
      setBusy(false);
    }
  }

  return {
    fields: { descripcion, setDescripcion, pesos, setPesos, pagador, setPagador },
    split,
    error,
    busy,
    save,
  };
}
