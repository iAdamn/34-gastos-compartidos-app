import { beforeEach, describe, expect, it } from "@jest/globals";

import { DATABASE_VERSION, migrateDbIfNeeded } from "@/db/migrations";
import type { Db } from "@/db/types";
import * as expenses from "@/repositories/expensesRepository";
import * as groups from "@/repositories/groupsRepository";
import * as payments from "@/repositories/paymentsRepository";
import type { LocalExpense, RemoteExpense, RemoteGroup } from "@/types";

import { createNodeDb } from "./helpers/nodeDb";

const group: RemoteGroup = {
  id: "g1",
  nombre: "Paseo",
  codigo: "ABC234",
  creador_uid: "ana",
  miembros: ["beto", "ana"],
  miembros_info: { ana: { nombre: "Ana" }, beto: { nombre: "Beto" } },
  creado_en: "2026-11-14T10:00:00.000Z",
};

function localExpense(change: Partial<LocalExpense> = {}): LocalExpense {
  return {
    id: "e1",
    grupo_id: "g1",
    pagador_uid: "ana",
    descripcion: "Mercado",
    monto_centavos: 1000000,
    participantes: ["ana", "beto"],
    porcentajes: null,
    fecha: "2026-11-14",
    creado_por: "ana",
    synced: false,
    deleted: false,
    pending: true,
    ...change,
  };
}

function remoteExpense(change: Partial<RemoteExpense> = {}): RemoteExpense {
  return {
    id: "e9",
    pagador_uid: "beto",
    descripcion: "Taxi al aeropuerto",
    monto_centavos: 500000,
    participantes: ["ana", "beto"],
    porcentajes: { ana: 40, beto: 60 },
    fecha: "2026-11-13",
    creado_por: "beto",
    updated_at: "2026-11-14T11:00:00.000Z",
    deleted_at: null,
    ...change,
  };
}

let db: Db;

beforeEach(async () => {
  db = createNodeDb();
  await migrateDbIfNeeded(db);
  await groups.upsertGroup(db, group);
});

describe("migraciones", () => {
  it("dejan la version de la base y se pueden correr dos veces", async () => {
    await migrateDbIfNeeded(db);

    const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(DATABASE_VERSION);
  });

  it("la base rechaza un gasto con monto en cero", async () => {
    await expect(
      expenses.insertPendingExpense(db, localExpense({ monto_centavos: 0 })),
    ).rejects.toThrow();
  });
});

describe("grupos", () => {
  it("guarda el grupo con sus miembros", async () => {
    expect(await groups.listGroups(db)).toEqual([
      { id: "g1", nombre: "Paseo", codigo: "ABC234", creador_uid: "ana" },
    ]);
    expect(await groups.listMembers(db, "g1")).toEqual([
      { uid: "ana", nombre: "Ana" },
      { uid: "beto", nombre: "Beto" },
    ]);
    expect(await groups.findGroup(db, "no-existe")).toBeNull();
  });

  it("actualizar el grupo no borra sus gastos ni la ultima sincronizacion", async () => {
    await expenses.insertPendingExpense(db, localExpense());
    await groups.setLastSync(db, "g1", "2026-11-14T12:00:00.000Z");

    await groups.upsertGroup(db, { ...group, nombre: "Paseo a la costa", miembros: ["ana"] });

    expect((await groups.findGroup(db, "g1"))?.nombre).toBe("Paseo a la costa");
    expect(await groups.listMembers(db, "g1")).toHaveLength(1);
    expect(await expenses.listExpenses(db, "g1")).toHaveLength(1);
    expect(await groups.getLastSync(db, "g1")).toBe("2026-11-14T12:00:00.000Z");
  });

  it("al cerrar sesion se borra todo", async () => {
    await expenses.insertPendingExpense(db, localExpense());

    await groups.clearAll(db);

    expect(await groups.listGroups(db)).toEqual([]);
    expect(await expenses.listExpenses(db, "g1")).toEqual([]);
  });
});

describe("gastos", () => {
  it("un gasto nuevo queda pendiente y sin enviar", async () => {
    await expenses.insertPendingExpense(db, localExpense());

    expect(await expenses.listExpenses(db, "g1")).toEqual([localExpense()]);
    expect(await expenses.listPendingExpenses(db, "g1")).toHaveLength(1);
  });

  it("al marcarlo como enviado deja de estar pendiente", async () => {
    await expenses.insertPendingExpense(db, localExpense());

    await expenses.markExpenseSynced(db, "e1");

    const [saved] = await expenses.listExpenses(db, "g1");
    expect(saved).toMatchObject({ synced: true, pending: false });
    expect(await expenses.listPendingExpenses(db, "g1")).toEqual([]);
  });

  it("un gasto eliminado no se lista pero queda pendiente de avisar", async () => {
    await expenses.insertPendingExpense(db, localExpense());
    await expenses.markExpenseSynced(db, "e1");

    await expenses.markExpenseDeleted(db, "e1");

    expect(await expenses.listExpenses(db, "g1")).toEqual([]);
    expect(await expenses.listPendingExpenses(db, "g1")).toMatchObject([{ deleted: true }]);
  });

  it("guarda lo que llega de la API, con porcentajes y borrados", async () => {
    await expenses.upsertExpenseFromServer(db, "g1", remoteExpense());
    await expenses.upsertExpenseFromServer(
      db,
      "g1",
      remoteExpense({ id: "e8", deleted_at: "2026-11-14T11:30:00.000Z" }),
    );

    const list = await expenses.listExpenses(db, "g1");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "e9",
      porcentajes: { ana: 40, beto: 60 },
      synced: true,
      pending: false,
    });
  });

  it("busca por descripcion sin que el texto rompa el SQL", async () => {
    await expenses.insertPendingExpense(db, localExpense());
    await expenses.upsertExpenseFromServer(db, "g1", remoteExpense());

    expect(await expenses.listExpenses(db, "g1", "taxi")).toHaveLength(1);
    expect(await expenses.listExpenses(db, "g1", "' OR 1=1 --")).toEqual([]);
    expect(await expenses.listExpenses(db, "g1")).toHaveLength(2);
  });

  it("quita un gasto que nunca se envio", async () => {
    await expenses.insertPendingExpense(db, localExpense());

    await expenses.removeExpense(db, "e1");

    expect(await expenses.listPendingExpenses(db, "g1")).toEqual([]);
  });
});

describe("pagos", () => {
  const payment = {
    id: "p1",
    grupo_id: "g1",
    de_uid: "beto",
    a_uid: "ana",
    monto_centavos: 500000,
    fecha: "2026-11-14T10:00:00.000Z",
    pending: true,
  };

  it("un pago nuevo queda pendiente hasta que se envia", async () => {
    await payments.insertPendingPayment(db, payment);
    expect(await payments.listPendingPayments(db, "g1")).toEqual([payment]);

    await payments.markPaymentSynced(db, "p1");

    expect(await payments.listPendingPayments(db, "g1")).toEqual([]);
    expect(await payments.listPayments(db, "g1")).toEqual([{ ...payment, pending: false }]);
  });

  it("guarda los pagos que llegan de la API y permite quitarlos", async () => {
    await payments.upsertPaymentFromServer(db, "g1", {
      id: "p2",
      de_uid: "ana",
      a_uid: "beto",
      monto_centavos: 100,
      fecha: "2026-11-14T10:00:00.000Z",
      updated_at: "2026-11-14T10:00:00.000Z",
    });
    expect(await payments.listPayments(db, "g1")).toHaveLength(1);

    await payments.removePayment(db, "p2");

    expect(await payments.listPayments(db, "g1")).toEqual([]);
  });
});
