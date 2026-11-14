import type { Db } from "./types";

// Migraciones con PRAGMA user_version.
// SQLite guarda un numero de version dentro del archivo. Al abrir la app se compara con
// DATABASE_VERSION y se aplica solo lo que falta. Una migracion ya publicada nunca se edita:
// se agrega otra y se sube el numero.
export const DATABASE_VERSION = 1;

// Version 1: las tablas del enunciado (grupo_cache y gasto_cache) con las columnas de
// sincronizacion, mas miembros, pagos y la fecha de la ultima sincronizacion de cada grupo.
const MIGRATION_1 = `
CREATE TABLE IF NOT EXISTS grupo_cache (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL,
  creador_uid TEXT NOT NULL,
  last_sync TEXT
);
CREATE TABLE IF NOT EXISTS miembro_cache (
  grupo_id TEXT NOT NULL REFERENCES grupo_cache(id) ON DELETE CASCADE,
  uid TEXT NOT NULL,
  nombre TEXT NOT NULL,
  PRIMARY KEY (grupo_id, uid)
);
CREATE TABLE IF NOT EXISTS gasto_cache (
  id TEXT PRIMARY KEY,
  grupo_id TEXT NOT NULL REFERENCES grupo_cache(id) ON DELETE CASCADE,
  pagador_uid TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  monto_centavos INTEGER NOT NULL CHECK (monto_centavos > 0),
  participantes TEXT NOT NULL,
  porcentajes TEXT,
  fecha TEXT NOT NULL,
  creado_por TEXT NOT NULL,
  remote_id TEXT,
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS pago_cache (
  id TEXT PRIMARY KEY,
  grupo_id TEXT NOT NULL REFERENCES grupo_cache(id) ON DELETE CASCADE,
  de_uid TEXT NOT NULL,
  a_uid TEXT NOT NULL,
  monto_centavos INTEGER NOT NULL CHECK (monto_centavos > 0),
  fecha TEXT NOT NULL,
  remote_id TEXT,
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS gasto_por_grupo ON gasto_cache (grupo_id, fecha);
CREATE INDEX IF NOT EXISTS pago_por_grupo ON pago_cache (grupo_id, fecha);
`;

export async function migrateDbIfNeeded(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) {
    return;
  }
  if (version < 1) {
    await db.execAsync(MIGRATION_1);
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
