import type { Shares } from "./split";

export type SuggestedPayment = {
  de_uid: string;
  a_uid: string;
  monto_centavos: number;
};

// Busca el uid que mas debe (saldo mas negativo). Si hay empate gana el uid menor.
function findBiggestDebtor(balances: Shares): string | undefined {
  let chosen: string | undefined;
  for (const uid of Object.keys(balances).sort()) {
    const balance = balances[uid] ?? 0;
    if (balance < 0 && (chosen === undefined || balance < (balances[chosen] ?? 0))) {
      chosen = uid;
    }
  }
  return chosen;
}

// Busca el uid al que mas le deben (saldo mas positivo). Si hay empate gana el uid menor.
function findBiggestCreditor(balances: Shares): string | undefined {
  let chosen: string | undefined;
  for (const uid of Object.keys(balances).sort()) {
    const balance = balances[uid] ?? 0;
    if (balance > 0 && (chosen === undefined || balance > (balances[chosen] ?? 0))) {
      chosen = uid;
    }
  }
  return chosen;
}

// Lista de pagos para dejar a todos en 0.
// Metodo: el que mas debe le paga al que mas le deben, y se repite.
// Cada pago deja al menos a una persona en 0, por eso salen maximo n - 1 pagos.
export function suggestPayments(balances: Shares): SuggestedPayment[] {
  const total = Object.values(balances).reduce((sum, value) => sum + value, 0);
  if (total !== 0) {
    throw new Error("Los saldos del grupo deben sumar 0");
  }
  const pending: Shares = { ...balances };
  const payments: SuggestedPayment[] = [];
  let debtor = findBiggestDebtor(pending);
  let creditor = findBiggestCreditor(pending);
  while (debtor !== undefined && creditor !== undefined) {
    const debt = -(pending[debtor] ?? 0);
    const credit = pending[creditor] ?? 0;
    const amount = Math.min(debt, credit);
    payments.push({ de_uid: debtor, a_uid: creditor, monto_centavos: amount });
    pending[debtor] = (pending[debtor] ?? 0) + amount;
    pending[creditor] = credit - amount;
    debtor = findBiggestDebtor(pending);
    creditor = findBiggestCreditor(pending);
  }
  return payments;
}
