// El dinero se guarda en centavos enteros (pesos x 100), como pide el enunciado.
// El peso colombiano no usa centavos, por eso todo monto es multiplo de 100.

// Unidad minima en la que se reparte un gasto: 1 peso.
export const SPLIT_UNIT_CENTS = 100;

// Un monto valido es entero, mayor que 0 y sin centavos sueltos.
export function isValidAmount(cents: number): boolean {
  return Number.isSafeInteger(cents) && cents > 0 && cents % SPLIT_UNIT_CENTS === 0;
}

export function pesosToCents(pesos: number): number {
  return pesos * 100;
}

// Muestra un monto como $100.000,00
export function formatCop(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const pesos = Math.floor(absolute / 100);
  const centsPart = String(absolute % 100).padStart(2, "0");
  // Pone un punto cada tres cifras, contando desde la derecha.
  const pesosWithDots = String(pesos).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}$${pesosWithDots},${centsPart}`;
}
