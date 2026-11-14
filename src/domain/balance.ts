import { splitByPercent, splitEqually, type Shares } from "./split";

// Lo minimo que se necesita de un gasto para calcular el balance.
export type ExpenseForBalance = {
  pagador_uid: string;
  monto_centavos: number;
  participantes: string[];
  porcentajes: Record<string, number> | null;
};

// Lo minimo que se necesita de un pago entre miembros.
export type PaymentForBalance = {
  de_uid: string;
  a_uid: string;
  monto_centavos: number;
};

// Suma un valor al saldo de un miembro. Si el uid no es miembro, no hace nada.
function addToBalance(balances: Shares, uid: string, deltaCents: number): void {
  const current = balances[uid];
  if (current !== undefined) {
    balances[uid] = current + deltaCents;
  }
}

function sharesOf(expense: ExpenseForBalance): Shares {
  if (expense.porcentajes) {
    return splitByPercent(expense.monto_centavos, expense.porcentajes);
  }
  return splitEqually(expense.monto_centavos, expense.participantes);
}

// Saldo de cada miembro: positivo si le deben, negativo si debe.
// saldo = lo que pago - lo que le toca + pagos que hizo - pagos que recibio
// Los gastos eliminados no se pasan a esta funcion.
export function computeBalances(
  members: string[],
  expenses: ExpenseForBalance[],
  payments: PaymentForBalance[],
): Shares {
  const balances: Shares = {};
  for (const uid of members) {
    balances[uid] = 0;
  }
  for (const expense of expenses) {
    addToBalance(balances, expense.pagador_uid, expense.monto_centavos);
    for (const [uid, share] of Object.entries(sharesOf(expense))) {
      addToBalance(balances, uid, -share);
    }
  }
  for (const payment of payments) {
    addToBalance(balances, payment.de_uid, payment.monto_centavos);
    addToBalance(balances, payment.a_uid, -payment.monto_centavos);
  }
  return balances;
}
