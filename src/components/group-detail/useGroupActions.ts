import { useState } from "react";

import { useSession } from "@/providers/SessionProvider";
import { canDelete, deleteExpense } from "@/services/expensesService";
import type { LocalExpense } from "@/types";

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrio un error";
}

// Acciones de la pantalla del grupo. Despues de cada una se vuelve a leer SQLite con reload.
export function useGroupActions(reload: () => void) {
  const { user } = useSession();
  const uid = user?.id ?? "";
  const [error, setError] = useState<string | null>(null);

  async function removeExpense(expense: LocalExpense) {
    setError(null);
    try {
      await deleteExpense(expense, uid);
      reload();
    } catch (e) {
      setError(errorText(e));
    }
  }

  return {
    error,
    canDeleteExpense: (expense: LocalExpense) => canDelete(expense, uid),
    removeExpense,
  };
}
