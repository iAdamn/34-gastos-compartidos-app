import * as Crypto from "expo-crypto";

import { getDatabase } from "@/db/database";
import { isValidAmount, pesosToCents } from "@/domain/money";
import { splitByPercent, splitEqually } from "@/domain/split";
import * as expenses from "@/repositories/expensesRepository";
import { insertPendingPayment } from "@/repositories/paymentsRepository";
import type { LocalExpense, LocalPayment } from "@/types";

import { syncGroupNow } from "./sync";

// Lo que llena el usuario en el formulario de gasto.
export type ExpenseForm = {
  descripcion: string;
  pesos: string;
  pagador_uid: string;
  participantes: string[];
  // null = partes iguales
  porcentajes: Record<string, number> | null;
};

// Pasa el texto que escribio el usuario a centavos. Devuelve null si no es un monto valido.
export function parsePesos(text: string): number | null {
  const digits = text.replace(/[.\s$]/g, "");
  if (!/^\d+$/.test(digits)) {
    return null;
  }
  const cents = pesosToCents(Number(digits));
  return isValidAmount(cents) ? cents : null;
}

// Revisa el formulario de gasto. Devuelve el mensaje de error, o null si esta bien.
export function validateExpenseForm(form: ExpenseForm): string | null {
  const description = form.descripcion.trim();
  if (description.length < 1 || description.length > 80) {
    return "La descripcion debe tener entre 1 y 80 caracteres";
  }
  const cents = parsePesos(form.pesos);
  if (cents === null) {
    return "Escribe el monto en pesos, sin centavos";
  }
  if (form.participantes.length === 0) {
    return "Elige al menos un participante";
  }
  try {
    // El reparto se prueba con la logica del dominio antes de guardar.
    if (form.porcentajes) {
      splitByPercent(cents, form.porcentajes);
    } else {
      splitEqually(cents, form.participantes);
    }
  } catch (error) {
    return error instanceof Error ? error.message : "Reparto invalido";
  }
  return null;
}

// Fecha de hoy como YYYY-MM-DD.
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Guarda el gasto en SQLite como pendiente y despues intenta sincronizar.
// Si no hay conexion el gasto queda guardado y se envia cuando vuelva.
export async function addExpense(gid: string, uid: string, form: ExpenseForm): Promise<void> {
  const cents = parsePesos(form.pesos);
  if (cents === null) {
    throw new Error("Monto invalido");
  }
  const expense: LocalExpense = {
    id: Crypto.randomUUID(),
    grupo_id: gid,
    pagador_uid: form.pagador_uid,
    descripcion: form.descripcion.trim(),
    monto_centavos: cents,
    participantes: form.participantes,
    porcentajes: form.porcentajes,
    fecha: today(),
    creado_por: uid,
    synced: false,
    deleted: false,
    pending: true,
  };
  await expenses.insertPendingExpense(await getDatabase(), expense);
  await syncGroupNow(gid);
}

// Solo quien creo el gasto puede eliminarlo.
export function canDelete(expense: LocalExpense, uid: string): boolean {
  return expense.creado_por === uid;
}

export async function deleteExpense(expense: LocalExpense, uid: string): Promise<void> {
  if (!canDelete(expense, uid)) {
    throw new Error("Solo quien creo el gasto puede eliminarlo");
  }
  const db = await getDatabase();
  if (expense.synced) {
    await expenses.markExpenseDeleted(db, expense.id);
  } else {
    // Nunca llego a la API: basta con quitarlo del telefono.
    await expenses.removeExpense(db, expense.id);
  }
  await syncGroupNow(expense.grupo_id);
}

// Registra un pago entre dos miembros. Igual que el gasto: primero SQLite, despues sincroniza.
export async function addPayment(
  gid: string,
  deUid: string,
  aUid: string,
  cents: number,
): Promise<void> {
  if (deUid === aUid || !isValidAmount(cents)) {
    throw new Error("Pago invalido");
  }
  const payment: LocalPayment = {
    id: Crypto.randomUUID(),
    grupo_id: gid,
    de_uid: deUid,
    a_uid: aUid,
    monto_centavos: cents,
    fecha: new Date().toISOString(),
    pending: true,
  };
  await insertPendingPayment(await getDatabase(), payment);
  await syncGroupNow(gid);
}
