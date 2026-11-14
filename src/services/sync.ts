import * as api from "@/api/api";
import { getDatabase } from "@/db/database";
import * as expenses from "@/repositories/expensesRepository";
import * as groups from "@/repositories/groupsRepository";
import * as payments from "@/repositories/paymentsRepository";

import { syncGroup, type SyncDeps } from "./syncService";

// Conecta la sincronizacion (syncService) con la API real y con SQLite.

async function buildDeps(): Promise<SyncDeps> {
  const db = await getDatabase();
  return {
    listPendingExpenses: (gid) => expenses.listPendingExpenses(db, gid),
    listPendingPayments: (gid) => payments.listPendingPayments(db, gid),
    postExpense: api.postExpense,
    deleteExpense: api.deleteExpense,
    postPayment: api.postPayment,
    getChanges: api.getChanges,
    markExpenseSynced: (id) => expenses.markExpenseSynced(db, id),
    removeExpense: (id) => expenses.removeExpense(db, id),
    markPaymentSynced: (id) => payments.markPaymentSynced(db, id),
    removePayment: (id) => payments.removePayment(db, id),
    getLastSync: (gid) => groups.getLastSync(db, gid),
    setLastSync: (gid, value) => groups.setLastSync(db, gid, value),
    saveGroup: (group) => groups.upsertGroup(db, group),
    saveExpense: (gid, expense) => expenses.upsertExpenseFromServer(db, gid, expense),
    savePayment: (gid, payment) => payments.upsertPaymentFromServer(db, gid, payment),
  };
}

// Sincroniza un grupo. Devuelve false si no se pudo (sin conexion o la API caida):
// la app sigue funcionando con lo guardado y lo pendiente se envia despues.
export async function syncGroupNow(gid: string): Promise<boolean> {
  try {
    await syncGroup(await buildDeps(), gid);
    return true;
  } catch {
    return false;
  }
}

// Trae la lista de mis grupos de la API, la guarda y sincroniza cada uno.
export async function syncEverything(): Promise<boolean> {
  try {
    const db = await getDatabase();
    const deps = await buildDeps();
    for (const group of await api.listGroups()) {
      await groups.upsertGroup(db, group);
      await syncGroup(deps, group.id);
    }
    return true;
  } catch {
    return false;
  }
}
