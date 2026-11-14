// Deteccion de una sacudida, sin nada de Expo: recibe lecturas y responde si o no.
// El acelerometro de Expo mide en g. Con el telefono quieto la aceleracion total es 1 (la gravedad).

export type Acceleration = { x: number; y: number; z: number };

// Aceleracion total a partir de la cual se considera una sacudida.
export const SHAKE_THRESHOLD_G = 2;
// Tiempo minimo entre dos sacudidas, para no contar varias veces el mismo movimiento.
export const SHAKE_COOLDOWN_MS = 1000;

// Tamano del vector de aceleracion (teorema de Pitagoras en 3 dimensiones).
export function accelerationMagnitude({ x, y, z }: Acceleration): number {
  return Math.sqrt(x * x + y * y + z * z);
}

// lastShakeAt es la hora de la ultima sacudida en milisegundos, o null si no ha habido.
export function isShake(sample: Acceleration, now: number, lastShakeAt: number | null): boolean {
  if (accelerationMagnitude(sample) < SHAKE_THRESHOLD_G) {
    return false;
  }
  return lastShakeAt === null || now - lastShakeAt >= SHAKE_COOLDOWN_MS;
}
