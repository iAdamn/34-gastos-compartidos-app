import { SPLIT_UNIT_CENTS, isValidAmount } from "./money";

// Cuanto le toca a cada persona: { uid: centavos }
export type Shares = Record<string, number>;

function assertValidAmount(amountCents: number): void {
  if (!isValidAmount(amountCents)) {
    throw new Error("El monto debe ser un entero en centavos, mayor que 0 y multiplo de 100");
  }
}

// Ordena los uid de menor a mayor. Asi el reparto del sobrante siempre da lo mismo.
function sortUids(uids: string[]): string[] {
  if (uids.length === 0) {
    throw new Error("Debe haber al menos un participante");
  }
  if (new Set(uids).size !== uids.length) {
    throw new Error("Hay participantes repetidos");
  }
  return [...uids].sort();
}

// Recibe cuantos pesos le tocan a cada uno y reparte los pesos que sobran,
// de a 1, empezando por el primer uid.
function buildShares(sortedUids: string[], basePesos: number[], totalPesos: number): Shares {
  const assigned = basePesos.reduce((sum, pesos) => sum + pesos, 0);
  const leftover = totalPesos - assigned;
  const shares: Shares = {};
  sortedUids.forEach((uid, index) => {
    const extra = index < leftover ? 1 : 0;
    shares[uid] = ((basePesos[index] ?? 0) + extra) * SPLIT_UNIT_CENTS;
  });
  return shares;
}

// Reparte un gasto en partes iguales.
export function splitEqually(amountCents: number, participants: string[]): Shares {
  assertValidAmount(amountCents);
  const sortedUids = sortUids(participants);
  const totalPesos = amountCents / SPLIT_UNIT_CENTS;
  const base = Math.floor(totalPesos / sortedUids.length);
  return buildShares(
    sortedUids,
    sortedUids.map(() => base),
    totalPesos,
  );
}

function assertValidPercents(percents: Record<string, number>): void {
  const values = Object.values(percents);
  if (values.some((percent) => !Number.isInteger(percent) || percent < 1)) {
    throw new Error("Cada porcentaje debe ser un entero de 1 o mas");
  }
  if (values.reduce((sum, percent) => sum + percent, 0) !== 100) {
    throw new Error("Los porcentajes deben sumar 100");
  }
}

// Reparte un gasto segun el porcentaje de cada persona.
export function splitByPercent(amountCents: number, percents: Record<string, number>): Shares {
  assertValidAmount(amountCents);
  const sortedUids = sortUids(Object.keys(percents));
  assertValidPercents(percents);
  const totalPesos = amountCents / SPLIT_UNIT_CENTS;
  const basePesos = sortedUids.map((uid) => Math.floor((totalPesos * (percents[uid] ?? 0)) / 100));
  return buildShares(sortedUids, basePesos, totalPesos);
}
