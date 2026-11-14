import type { GroupDetail } from "@/services/groupsService";
import type { LocalExpense } from "@/types";

// Datos de ejemplo de un grupo para las pruebas de pantallas.
// u1 es Ana (la usuaria con sesion), u2 es Beto.

export function makeExpense(overrides: Partial<LocalExpense> = {}): LocalExpense {
  return {
    id: "e1",
    grupo_id: "g1",
    pagador_uid: "u1",
    descripcion: "Mercado",
    monto_centavos: 2000000,
    participantes: ["u1", "u2"],
    porcentajes: null,
    fecha: "2026-11-14",
    creado_por: "u1",
    synced: true,
    deleted: false,
    pending: false,
    ...overrides,
  };
}

export function makeDetail(overrides: Partial<GroupDetail> = {}): GroupDetail {
  return {
    group: { id: "g1", nombre: "Viaje a Cartagena", codigo: "ABC123", creador_uid: "u1" },
    members: [
      { uid: "u1", nombre: "Ana" },
      { uid: "u2", nombre: "Beto" },
    ],
    expenses: [makeExpense()],
    payments: [],
    balances: { u1: 1000000, u2: -1000000 },
    suggested: [{ de_uid: "u2", a_uid: "u1", monto_centavos: 1000000 }],
    ...overrides,
  };
}
