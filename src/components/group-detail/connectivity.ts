// NetInfo avisa cada cambio de red. Solo interesa el momento en que pasa de sin red a con red.
// null significa que todavia no se sabe si hay conexion.
export function cameBackOnline(before: boolean | null, now: boolean | null): boolean {
  return before === false && now === true;
}
