import type { Db } from "@/db/types";
import type { LocalExpense, RemoteExpense } from "@/types";

// Todo el SQL de gastos. Siempre con parametros (?), nunca pegando texto.

// Fila tal como esta en la tabla gasto_cache.
type ExpenseRow = {
  id: string;
  grupo_id: string;
  pagador_uid: string;
  descripcion: string;
  monto_centavos: number;
  participantes: string;
  porcentajes: string | null;
  fecha: string;
  creado_por: string;
  remote_id: string | null;
  deleted: number;
  pending: number;
};

const COLUMNS = `id, grupo_id, pagador_uid, descripcion, monto_centavos, participantes,
  porcentajes, fecha, creado_por, remote_id, deleted, pending`;

// Pasa una fila de SQLite a un gasto. Las listas se guardan como texto JSON.
function toExpense(row: ExpenseRow): LocalExpense {
  return {
    id: row.id,
    grupo_id: row.grupo_id,
    pagador_uid: row.pagador_uid,
    descripcion: row.descripcion,
    monto_centavos: row.monto_centavos,
    participantes: JSON.parse(row.participantes),
    porcentajes: row.porcentajes ? JSON.parse(row.porcentajes) : null,
    fecha: row.fecha,
    creado_por: row.creado_por,
    synced: row.remote_id !== null,
    deleted: row.deleted === 1,
    pending: row.pending === 1,
  };
}

// Gastos visibles de un grupo. Con texto busca en la descripcion.
export async function listExpenses(db: Db, gid: string, search = ""): Promise<LocalExpense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    `SELECT ${COLUMNS} FROM gasto_cache
     WHERE grupo_id = ? AND deleted = 0 AND descripcion LIKE ?
     ORDER BY fecha DESC, id`,
    [gid, `%${search}%`],
  );
  return rows.map(toExpense);
}

// Gastos que falta enviar a la API: creados o eliminados sin conexion.
export async function listPendingExpenses(db: Db, gid: string): Promise<LocalExpense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    `SELECT ${COLUMNS} FROM gasto_cache WHERE grupo_id = ? AND pending = 1`,
    [gid],
  );
  return rows.map(toExpense);
}

// Guarda un gasto nuevo hecho en el telefono. Queda pendiente de envio.
export async function insertPendingExpense(db: Db, expense: LocalExpense): Promise<void> {
  await db.runAsync(
    `INSERT INTO gasto_cache (id, grupo_id, pagador_uid, descripcion, monto_centavos,
       participantes, porcentajes, fecha, creado_por, remote_id, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 1)`,
    [
      expense.id,
      expense.grupo_id,
      expense.pagador_uid,
      expense.descripcion,
      expense.monto_centavos,
      JSON.stringify(expense.participantes),
      expense.porcentajes ? JSON.stringify(expense.porcentajes) : null,
      expense.fecha,
      expense.creado_por,
    ],
  );
}

// Guarda o reemplaza un gasto que llego de la API. Gana lo que diga el servidor.
export async function upsertExpenseFromServer(
  db: Db,
  gid: string,
  expense: RemoteExpense,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO gasto_cache (id, grupo_id, pagador_uid, descripcion, monto_centavos,
       participantes, porcentajes, fecha, creado_por, remote_id, updated_at, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      expense.id,
      gid,
      expense.pagador_uid,
      expense.descripcion,
      expense.monto_centavos,
      JSON.stringify(expense.participantes),
      expense.porcentajes ? JSON.stringify(expense.porcentajes) : null,
      expense.fecha,
      expense.creado_por,
      expense.id,
      expense.updated_at,
      expense.deleted_at ? 1 : 0,
    ],
  );
}

// Marca un gasto como eliminado y pendiente de avisar a la API.
export async function markExpenseDeleted(db: Db, id: string): Promise<void> {
  await db.runAsync("UPDATE gasto_cache SET deleted = 1, pending = 1 WHERE id = ?", [id]);
}

// La API ya recibio el gasto: deja de estar pendiente.
export async function markExpenseSynced(db: Db, id: string): Promise<void> {
  await db.runAsync("UPDATE gasto_cache SET remote_id = id, pending = 0 WHERE id = ?", [id]);
}

// Quita la fila del telefono. Para gastos que nunca llegaron a la API.
export async function removeExpense(db: Db, id: string): Promise<void> {
  await db.runAsync("DELETE FROM gasto_cache WHERE id = ?", [id]);
}
