import type { Db } from "@/db/types";
import type { LocalPayment, RemotePayment } from "@/types";

// Todo el SQL de pagos entre miembros. Siempre con parametros (?).

type PaymentRow = {
  id: string;
  grupo_id: string;
  de_uid: string;
  a_uid: string;
  monto_centavos: number;
  fecha: string;
  pending: number;
};

const COLUMNS = "id, grupo_id, de_uid, a_uid, monto_centavos, fecha, pending";

function toPayment(row: PaymentRow): LocalPayment {
  return { ...row, pending: row.pending === 1 };
}

export async function listPayments(db: Db, gid: string): Promise<LocalPayment[]> {
  const rows = await db.getAllAsync<PaymentRow>(
    `SELECT ${COLUMNS} FROM pago_cache WHERE grupo_id = ? AND deleted = 0 ORDER BY fecha DESC, id`,
    [gid],
  );
  return rows.map(toPayment);
}

export async function listPendingPayments(db: Db, gid: string): Promise<LocalPayment[]> {
  const rows = await db.getAllAsync<PaymentRow>(
    `SELECT ${COLUMNS} FROM pago_cache WHERE grupo_id = ? AND pending = 1`,
    [gid],
  );
  return rows.map(toPayment);
}

// Guarda un pago hecho en el telefono. Queda pendiente de envio.
export async function insertPendingPayment(db: Db, payment: LocalPayment): Promise<void> {
  await db.runAsync(
    `INSERT INTO pago_cache (id, grupo_id, de_uid, a_uid, monto_centavos, fecha, remote_id, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 0, 1)`,
    [
      payment.id,
      payment.grupo_id,
      payment.de_uid,
      payment.a_uid,
      payment.monto_centavos,
      payment.fecha,
    ],
  );
}

// Guarda o reemplaza un pago que llego de la API.
export async function upsertPaymentFromServer(
  db: Db,
  gid: string,
  payment: RemotePayment,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO pago_cache (id, grupo_id, de_uid, a_uid, monto_centavos, fecha,
       remote_id, updated_at, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      payment.id,
      gid,
      payment.de_uid,
      payment.a_uid,
      payment.monto_centavos,
      payment.fecha,
      payment.id,
      payment.updated_at,
    ],
  );
}

export async function markPaymentSynced(db: Db, id: string): Promise<void> {
  await db.runAsync("UPDATE pago_cache SET remote_id = id, pending = 0 WHERE id = ?", [id]);
}

export async function removePayment(db: Db, id: string): Promise<void> {
  await db.runAsync("DELETE FROM pago_cache WHERE id = ?", [id]);
}
