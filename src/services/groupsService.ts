import * as api from "@/api/api";
import { getDatabase } from "@/db/database";
import { computeBalances } from "@/domain/balance";
import { isValidGroupCode, normalizeGroupCode } from "@/domain/groupCode";
import { suggestPayments, type SuggestedPayment } from "@/domain/settle";
import type { Shares } from "@/domain/split";
import { listExpenses } from "@/repositories/expensesRepository";
import * as groups from "@/repositories/groupsRepository";
import { listPayments } from "@/repositories/paymentsRepository";
import type { LocalExpense, LocalGroup, LocalPayment, Member } from "@/types";

import { syncGroupNow } from "./sync";

// Crear grupo y unirse necesitan conexion: el codigo lo valida el servidor.

export async function createGroup(nombre: string, miNombre: string): Promise<LocalGroup> {
  const group = await api.createGroup(nombre.trim(), miNombre.trim());
  await groups.upsertGroup(await getDatabase(), group);
  return group;
}

export async function joinGroup(codigo: string, miNombre: string): Promise<LocalGroup> {
  const group = await api.joinGroup(normalizeGroupCode(codigo), miNombre.trim());
  await groups.upsertGroup(await getDatabase(), group);
  await syncGroupNow(group.id);
  return group;
}

// Mis grupos, leidos de SQLite. Funciona sin conexion.
export async function listLocalGroups(): Promise<LocalGroup[]> {
  return groups.listGroups(await getDatabase());
}

// Revisa el formulario de crear grupo. Devuelve el mensaje de error, o null si esta bien.
export function validateGroupForm(nombre: string, miNombre: string): string | null {
  if (nombre.trim().length < 1 || nombre.trim().length > 40) {
    return "El nombre del grupo debe tener entre 1 y 40 caracteres";
  }
  if (miNombre.trim().length < 1 || miNombre.trim().length > 30) {
    return "Tu nombre debe tener entre 1 y 30 caracteres";
  }
  return null;
}

// Revisa el formulario de unirse. Devuelve el mensaje de error, o null si esta bien.
export function validateJoinForm(codigo: string, miNombre: string): string | null {
  if (!isValidGroupCode(normalizeGroupCode(codigo))) {
    return "El codigo tiene 6 letras o numeros";
  }
  if (miNombre.trim().length < 1 || miNombre.trim().length > 30) {
    return "Tu nombre debe tener entre 1 y 30 caracteres";
  }
  return null;
}

export type GroupDetail = {
  group: LocalGroup;
  members: Member[];
  expenses: LocalExpense[];
  payments: LocalPayment[];
  balances: Shares;
  suggested: SuggestedPayment[];
};

// Todo lo que muestra la pantalla de un grupo, leido de SQLite.
// El balance y los pagos sugeridos se calculan en el telefono con la misma logica del servidor,
// por eso se ven sin conexion e incluyen lo que todavia no se ha enviado.
export async function loadGroupDetail(gid: string, search = ""): Promise<GroupDetail | null> {
  const db = await getDatabase();
  const group = await groups.findGroup(db, gid);
  if (!group) {
    return null;
  }
  const members = await groups.listMembers(db, gid);
  const allExpenses = await listExpenses(db, gid);
  const payments = await listPayments(db, gid);
  const balances = computeBalances(
    members.map((member) => member.uid),
    allExpenses,
    payments,
  );
  const expenses = search ? await listExpenses(db, gid, search) : allExpenses;
  return { group, members, expenses, payments, balances, suggested: suggestPayments(balances) };
}
