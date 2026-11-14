import { ApiClientError } from "@/api/client";
import type {
  LocalExpense,
  LocalPayment,
  RemoteExpense,
  RemoteGroup,
  RemotePayment,
} from "@/types";

// Sincronizacion de un grupo. Primero se envia lo pendiente y despues se traen los cambios.
// No importa nada de SQLite ni de fetch: recibe todo lo que necesita en "deps".
// Asi se puede probar con dependencias de mentira.

// La API devuelve maximo 500 elementos por lista en cada llamada.
export const SYNC_PAGE_SIZE = 500;

export type ChangesResponse = {
  grupo: RemoteGroup;
  gastos: RemoteExpense[];
  pagos: RemotePayment[];
  servidor_ahora: string;
};

export type SyncDeps = {
  // Lo pendiente guardado en el telefono.
  listPendingExpenses: (gid: string) => Promise<LocalExpense[]>;
  listPendingPayments: (gid: string) => Promise<LocalPayment[]>;
  // Llamadas a la API.
  postExpense: (gid: string, expense: LocalExpense) => Promise<void>;
  deleteExpense: (gid: string, id: string) => Promise<void>;
  postPayment: (gid: string, payment: LocalPayment) => Promise<void>;
  getChanges: (gid: string, since: string | null) => Promise<ChangesResponse>;
  // Cambios en la base local.
  markExpenseSynced: (id: string) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  markPaymentSynced: (id: string) => Promise<void>;
  removePayment: (id: string) => Promise<void>;
  getLastSync: (gid: string) => Promise<string | null>;
  setLastSync: (gid: string, value: string) => Promise<void>;
  saveGroup: (group: RemoteGroup) => Promise<void>;
  saveExpense: (gid: string, expense: RemoteExpense) => Promise<void>;
  savePayment: (gid: string, payment: RemotePayment) => Promise<void>;
};

// La API rechazo el dato (400, 403, 404, 409). Reintentar no sirve de nada.
function isRejected(error: unknown): boolean {
  return error instanceof ApiClientError && error.status >= 400 && error.status < 500;
}

// Intenta enviar un pendiente. Devuelve "sent" si la API lo acepto y "rejected" si lo rechazo.
// Si no hay red o la API falla, el error sigue hacia arriba y el pendiente queda para despues.
async function trySend(action: () => Promise<void>): Promise<"sent" | "rejected"> {
  try {
    await action();
    return "sent";
  } catch (error) {
    if (isRejected(error)) {
      return "rejected";
    }
    throw error;
  }
}

async function pushExpense(deps: SyncDeps, gid: string, expense: LocalExpense): Promise<void> {
  if (expense.deleted) {
    // Eliminado sin conexion. Si la API dice que ya no existe, da igual: queda eliminado.
    await trySend(() => deps.deleteExpense(gid, expense.id));
    await deps.markExpenseSynced(expense.id);
    return;
  }
  const result = await trySend(() => deps.postExpense(gid, expense));
  if (result === "sent") {
    await deps.markExpenseSynced(expense.id);
  } else {
    await deps.removeExpense(expense.id);
  }
}

async function pushPayment(deps: SyncDeps, gid: string, payment: LocalPayment): Promise<void> {
  const result = await trySend(() => deps.postPayment(gid, payment));
  if (result === "sent") {
    await deps.markPaymentSynced(payment.id);
  } else {
    await deps.removePayment(payment.id);
  }
}

// El updated_at mas reciente de una lista. Sirve para pedir la pagina siguiente.
function lastUpdatedAt(items: { updated_at: string }[], fallback: string | null): string | null {
  return items.reduce<string | null>(
    (latest, item) => (latest === null || item.updated_at > latest ? item.updated_at : latest),
    fallback,
  );
}

async function pullChanges(deps: SyncDeps, gid: string): Promise<void> {
  let since = await deps.getLastSync(gid);
  let hasMore = true;
  while (hasMore) {
    const changes = await deps.getChanges(gid, since);
    await deps.saveGroup(changes.grupo);
    for (const expense of changes.gastos) {
      await deps.saveExpense(gid, expense);
    }
    for (const payment of changes.pagos) {
      await deps.savePayment(gid, payment);
    }
    hasMore = changes.gastos.length === SYNC_PAGE_SIZE || changes.pagos.length === SYNC_PAGE_SIZE;
    if (hasMore) {
      since = lastUpdatedAt([...changes.gastos, ...changes.pagos], since);
    } else {
      await deps.setLastSync(gid, changes.servidor_ahora);
    }
  }
}

export async function syncGroup(deps: SyncDeps, gid: string): Promise<void> {
  for (const expense of await deps.listPendingExpenses(gid)) {
    await pushExpense(deps, gid, expense);
  }
  for (const payment of await deps.listPendingPayments(gid)) {
    await pushPayment(deps, gid, payment);
  }
  await pullChanges(deps, gid);
}
