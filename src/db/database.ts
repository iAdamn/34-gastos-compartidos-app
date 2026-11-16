import * as SQLite from "expo-sqlite";

import { migrateDbIfNeeded } from "./migrations";
import type { Db, SqlParam } from "./types";

const DATABASE_NAME = "gastos.db";

let databasePromise: Promise<Db> | undefined;

// Deja la base de expo-sqlite con la forma pequena que usa la app (ver types.ts).
function toDb(sqlite: SQLite.SQLiteDatabase): Db {
  return {
    execAsync: (sql) => sqlite.execAsync(sql),
    runAsync: (sql, params: SqlParam[] = []) => sqlite.runAsync(sql, params),
    getAllAsync: <T>(sql: string, params: SqlParam[] = []) => sqlite.getAllAsync<T>(sql, params),
    getFirstAsync: <T>(sql: string, params: SqlParam[] = []) =>
      sqlite.getFirstAsync<T>(sql, params),
    withTransactionAsync: (task) => sqlite.withTransactionAsync(task),
  };
}

async function openAndMigrate(): Promise<Db> {
  const db = toDb(await SQLite.openDatabaseAsync(DATABASE_NAME));
  // Sin esto SQLite no aplica los ON DELETE CASCADE.
  await db.execAsync("PRAGMA foreign_keys = ON");
  await migrateDbIfNeeded(db);
  return db;
}

// Devuelve siempre la misma conexion. La primera vez abre la base y corre las migraciones.
export function getDatabase(): Promise<Db> {
  if (!databasePromise) {
    databasePromise = openAndMigrate();
  }
  return databasePromise;
}
