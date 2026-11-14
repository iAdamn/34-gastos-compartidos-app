import type { Member } from "@/types";

// Nombre visible de un miembro. Si no se encuentra se muestra el uid.
export function memberName(members: Member[], uid: string): string {
  return members.find((member) => member.uid === uid)?.nombre ?? uid;
}
