import { useEffect, useState } from "react";

import { loadGroupDetail } from "@/services/groupsService";
import type { Member } from "@/types";

// Miembros del grupo, leidos de SQLite. failed = true si el grupo no se pudo leer.
export function useGroupMembers(gid: string) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadGroupDetail(gid)
      .then((detail) => (detail ? setMembers(detail.members) : setFailed(true)))
      .catch(() => setFailed(true));
  }, [gid]);

  return { members, failed };
}
