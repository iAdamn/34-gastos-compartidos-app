import { useState } from "react";

import type { SuggestedPayment } from "@/domain/settle";
import { useSession } from "@/providers/SessionProvider";
import { vibrateSuccess } from "@/sensors/haptics";
import { addPayment, canDelete, deleteExpense } from "@/services/expensesService";
import type { LocalExpense } from "@/types";

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrio un error";
}

// Acciones de la pantalla del grupo. Despues de cada una se vuelve a leer SQLite con reload.
export function useGroupActions(gid: string, reload: () => void) {
  const { user } = useSession();
  const uid = user?.id ?? "";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Pago sugerido que el usuario eligio y falta confirmar.
  const [selected, setSelected] = useState<SuggestedPayment | null>(null);

  async function run(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    try {
      await action();
      reload();
    } catch (e) {
      setError(errorText(e));
    }
  }

  function confirmPayment() {
    const payment = selected;
    setSelected(null);
    if (!payment) {
      return;
    }
    run(async () => {
      await addPayment(gid, payment.de_uid, payment.a_uid, payment.monto_centavos);
      // El mensaje se muestra siempre: es la alternativa si el telefono no vibra.
      await vibrateSuccess();
      setMessage("Pago registrado");
    });
  }

  return {
    error,
    message,
    selected,
    selectPayment: setSelected,
    cancelPayment: () => setSelected(null),
    confirmPayment,
    canDeleteExpense: (expense: LocalExpense) => canDelete(expense, uid),
    removeExpense: (expense: LocalExpense) => run(() => deleteExpense(expense, uid)),
  };
}
