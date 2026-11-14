import { DatabaseSync } from "node:sqlite";

import type { Db, SqlParam } from "@/db/types";

// Base SQLite de verdad, en memoria, usando el SQLite que trae Node.
// Asi las pruebas ejecutan el mismo SQL que correra en el telefono.
export function createNodeDb(): Db {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  return {
    execAsync: async (sql) => {
      sqlite.exec(sql);
    },
    runAsync: async (sql, params: SqlParam[] = []) => {
      sqlite.prepare(sql).run(...params);
    },
    // Node devuelve las filas sin tipo. El tipo lo da quien llama, igual que en expo-sqlite.
    getAllAsync: async <T>(sql: string, params: SqlParam[] = []) =>
      sqlite.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T>(sql: string, params: SqlParam[] = []) =>
      (sqlite.prepare(sql).get(...params) as T | undefined) ?? null,
  };
}
