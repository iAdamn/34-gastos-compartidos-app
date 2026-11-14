import { describe, expect, it } from "@jest/globals";

import { ApiClientError } from "@/api/client";
import type { LocalExpense, LocalPayment, RemoteExpense, RemoteGroup } from "@/types";

import { SYNC_PAGE_SIZE, syncGroup, type ChangesResponse, type SyncDeps } from "./syncService";

const group: RemoteGroup = {
  id: "g1",
  nombre: "Paseo",
  codigo: "ABC234",
  creador_uid: "ana",
  miembros: ["ana", "beto"],
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

function remoteExpense(id: string, updatedAt: string): RemoteExpense {
  return {
    id,
    pagador_uid: "beto",
    descripcion: "Taxi",
    monto_centavos: 500000,
    participantes: ["ana", "beto"],
    porcentajes: null,
    fecha: "2026-11-14",
    creado_por: "beto",
    updated_at: updatedAt,
    deleted_at: null,
  };
}

function emptyChanges(): ChangesResponse {
  return { grupo: group, gastos: [], pagos: [], servidor_ahora: "2026-11-14T12:00:00.000Z" };
}

// Arma dependencias de mentira y anota todo lo que hace la sincronizacion.
function fakeDeps(options: {
  pendingExpenses?: LocalExpense[];
  pendingPayments?: LocalPayment[];
  pages?: ChangesResponse[];
  postError?: ApiClientError;
}) {
  const log: string[] = [];
  const pages = options.pages ?? [emptyChanges()];
  const deps: SyncDeps = {
    listPendingExpenses: async () => options.pendingExpenses ?? [],
    listPendingPayments: async () => options.pendingPayments ?? [],
    postExpense: async (_gid, expense) => {
      if (options.postError) {
        throw options.postError;
      }
      log.push(`post gasto ${expense.id}`);
    },
    deleteExpense: async (_gid, id) => {
      log.push(`delete gasto ${id}`);
    },
    postPayment: async (_gid, payment) => {
      log.push(`post pago ${payment.id}`);
    },
    markExpenseSynced: async (id) => {
      log.push(`gasto enviado ${id}`);
    },
    removeExpense: async (id) => {
      log.push(`gasto quitado ${id}`);
    },
    markPaymentSynced: async (id) => {
      log.push(`pago enviado ${id}`);
    },
    removePayment: async (id) => {
      log.push(`pago quitado ${id}`);
    },
    getLastSync: async () => "2026-11-14T11:00:00.000Z",
    getChanges: async (_gid, since) => {
      log.push(`cambios desde ${since}`);
      return pages.shift() ?? emptyChanges();
    },
    saveGroup: async () => {
      log.push("grupo guardado");
    },
    saveExpense: async (_gid, expense) => {
      log.push(`gasto guardado ${expense.id}`);
    },
    savePayment: async (_gid, payment) => {
      log.push(`pago guardado ${payment.id}`);
    },
    setLastSync: async (_gid, value) => {
      log.push(`ultima sincronizacion ${value}`);
    },
  };
  return { deps, log };
}

describe("sincronizacion de un grupo", () => {
  it("envia un gasto pendiente una sola vez y lo marca como enviado", async () => {
    const { deps, log } = fakeDeps({ pendingExpenses: [localExpense()] });

    await syncGroup(deps, "g1");

    expect(log.filter((line) => line === "post gasto e1")).toHaveLength(1);
    expect(log).toContain("gasto enviado e1");
  });

  it("avisa a la API de un gasto eliminado sin conexion", async () => {
    const pending = localExpense({ synced: true, deleted: true });
    const { deps, log } = fakeDeps({ pendingExpenses: [pending] });

    await syncGroup(deps, "g1");

    expect(log).toContain("delete gasto e1");
    expect(log).toContain("gasto enviado e1");
  });

  it("envia los pagos pendientes", async () => {
    const payment: LocalPayment = {
      id: "p1",
      grupo_id: "g1",
      de_uid: "beto",
      a_uid: "ana",
      monto_centavos: 500000,
      fecha: "2026-11-14T10:00:00.000Z",
      pending: true,
    };
    const { deps, log } = fakeDeps({ pendingPayments: [payment] });

    await syncGroup(deps, "g1");

    expect(log).toContain("post pago p1");
    expect(log).toContain("pago enviado p1");
  });

  it("sin red deja el gasto pendiente y no trae cambios", async () => {
    const { deps, log } = fakeDeps({
      pendingExpenses: [localExpense()],
      postError: new ApiClientError(0, "Sin conexion"),
    });

    await expect(syncGroup(deps, "g1")).rejects.toMatchObject({ status: 0 });
    expect(log).toEqual([]);
  });

  it("si la API rechaza el gasto lo quita del telefono y sigue", async () => {
    const { deps, log } = fakeDeps({
      pendingExpenses: [localExpense()],
      postError: new ApiClientError(400, "Datos invalidos"),
    });

    await syncGroup(deps, "g1");

    expect(log).toContain("gasto quitado e1");
    expect(log).toContain("grupo guardado");
  });

  it("trae los cambios desde la ultima sincronizacion y guarda la hora del servidor", async () => {
    const changes = {
      ...emptyChanges(),
      gastos: [remoteExpense("e9", "2026-11-14T11:30:00.000Z")],
    };
    const { deps, log } = fakeDeps({ pages: [changes] });

    await syncGroup(deps, "g1");

    expect(log).toEqual([
      "cambios desde 2026-11-14T11:00:00.000Z",
      "grupo guardado",
      "gasto guardado e9",
      "ultima sincronizacion 2026-11-14T12:00:00.000Z",
    ]);
  });

  it("si llegan 500 gastos pide otra pagina desde el ultimo updated_at", async () => {
    const fullPage = Array.from({ length: SYNC_PAGE_SIZE }, (_, index) =>
      // Los milisegundos crecen con el indice, igual que la API, que ordena por updated_at.
      remoteExpense(`e${index}`, `2026-11-14T11:30:00.${String(index).padStart(3, "0")}Z`),
    );
    const lastUpdatedAt = fullPage[fullPage.length - 1]?.updated_at;
    const { deps, log } = fakeDeps({
      pages: [{ ...emptyChanges(), gastos: fullPage }, emptyChanges()],
    });

    await syncGroup(deps, "g1");

    const requests = log.filter((line) => line.startsWith("cambios desde"));
    expect(requests).toEqual([
      "cambios desde 2026-11-14T11:00:00.000Z",
      `cambios desde ${lastUpdatedAt}`,
    ]);
  });
});
