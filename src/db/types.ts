// Lo minimo de SQLite que usa la app. La base real de expo-sqlite cumple con esta forma,
// y en las pruebas se usa el SQLite que trae Node.
export type SqlParam = string | number | null;

export type Db = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: SqlParam[]) => Promise<unknown>;
  getAllAsync: <T>(sql: string, params?: SqlParam[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, params?: SqlParam[]) => Promise<T | null>;
};
