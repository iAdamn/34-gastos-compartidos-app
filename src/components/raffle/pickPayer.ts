import type { Member } from "@/types";

// Elige un miembro al azar. Recibe la funcion de azar para poder probarla con valores fijos.
export function pickRandomMember(members: Member[], random: () => number): Member | undefined {
  return members[Math.floor(random() * members.length)];
}
