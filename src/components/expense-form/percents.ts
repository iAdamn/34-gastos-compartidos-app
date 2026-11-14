export type Percents = Record<string, number>;

// Cuanto suben o bajan los botones + y -.
export const PERCENT_STEP = 5;

// Reparte 100 % en partes iguales enteras. Lo que sobra va de a 1 al uid menor,
// igual que el reparto de pesos del dominio.
export function evenPercents(uids: string[]): Percents {
  const sorted = [...uids].sort();
  const result: Percents = {};
  if (sorted.length === 0) {
    return result;
  }
  const base = Math.floor(100 / sorted.length);
  const remainder = 100 - base * sorted.length;
  sorted.forEach((uid, index) => {
    result[uid] = base + (index < remainder ? 1 : 0);
  });
  return result;
}

export function percentTotal(percents: Percents): number {
  return Object.values(percents).reduce((sum, value) => sum + value, 0);
}

// Cambia el porcentaje de un participante sin bajar de 1 ni pasar de 100.
export function changePercent(percents: Percents, uid: string, delta: number): Percents {
  const next = (percents[uid] ?? 0) + delta;
  return { ...percents, [uid]: Math.min(100, Math.max(1, next)) };
}

// Agrega el uid si no estaba y lo quita si estaba.
export function toggleParticipant(participants: string[], uid: string): string[] {
  return participants.includes(uid)
    ? participants.filter((current) => current !== uid)
    : [...participants, uid];
}
