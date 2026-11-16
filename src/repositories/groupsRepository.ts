import type { Db } from "@/db/types";
import type { LocalGroup, Member, RemoteGroup } from "@/types";

// Todo el SQL de grupos y miembros. Siempre con parametros (?), nunca pegando texto.

// Guarda o actualiza un grupo que llego de la API, con sus miembros.
// Va en una transaccion: si algo falla a mitad de camino el grupo no queda sin miembros.
export function upsertGroup(db: Db, group: RemoteGroup): Promise<void> {
  return db.withTransactionAsync(() => writeGroup(db, group));
}

async function writeGroup(db: Db, group: RemoteGroup): Promise<void> {
  await db.runAsync(
    `INSERT INTO grupo_cache (id, nombre, codigo, creador_uid) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre, codigo = excluded.codigo`,
    [group.id, group.nombre, group.codigo, group.creador_uid],
  );
  await db.runAsync("DELETE FROM miembro_cache WHERE grupo_id = ?", [group.id]);
  for (const uid of group.miembros) {
    const nombre = group.miembros_info[uid]?.nombre ?? uid;
    await db.runAsync("INSERT INTO miembro_cache (grupo_id, uid, nombre) VALUES (?, ?, ?)", [
      group.id,
      uid,
      nombre,
    ]);
  }
}

export function listGroups(db: Db): Promise<LocalGroup[]> {
  return db.getAllAsync<LocalGroup>(
    "SELECT id, nombre, codigo, creador_uid FROM grupo_cache ORDER BY nombre",
  );
}

export function findGroup(db: Db, gid: string): Promise<LocalGroup | null> {
  return db.getFirstAsync<LocalGroup>(
    "SELECT id, nombre, codigo, creador_uid FROM grupo_cache WHERE id = ?",
    [gid],
  );
}

export function listMembers(db: Db, gid: string): Promise<Member[]> {
  return db.getAllAsync<Member>(
    "SELECT uid, nombre FROM miembro_cache WHERE grupo_id = ? ORDER BY uid",
    [gid],
  );
}

// Fecha del servidor en la ultima sincronizacion del grupo. null si nunca se sincronizo.
export async function getLastSync(db: Db, gid: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ last_sync: string | null }>(
    "SELECT last_sync FROM grupo_cache WHERE id = ?",
    [gid],
  );
  return row?.last_sync ?? null;
}

export async function setLastSync(db: Db, gid: string, lastSync: string): Promise<void> {
  await db.runAsync("UPDATE grupo_cache SET last_sync = ? WHERE id = ?", [lastSync, gid]);
}

// Borra todo lo guardado. Se usa al cerrar sesion. Los ON DELETE CASCADE borran el resto.
export async function clearAll(db: Db): Promise<void> {
  await db.runAsync("DELETE FROM grupo_cache");
}
