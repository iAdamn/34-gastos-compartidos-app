import * as api from "@/api/api";
import { getDatabase } from "@/db/database";
import { clearAll } from "@/repositories/groupsRepository";
import type { SessionUser } from "@/types";

import { loadDataOwner, saveDataOwner, saveUser, tokenStore } from "./session";

// Guarda los tokens y el usuario que devolvio la API.
async function startSession(session: {
  token: string;
  refreshToken: string;
  usuario: SessionUser;
}): Promise<SessionUser> {
  // Si la sesion anterior vencio, los datos de esa persona siguen en el telefono.
  // Si ahora entra otra persona se borran. Si es la misma se conservan, con sus pendientes.
  const owner = await loadDataOwner();
  if (owner !== null && owner !== session.usuario.id) {
    await clearAll(await getDatabase());
  }
  await saveDataOwner(session.usuario.id);
  await tokenStore.set({ token: session.token, refreshToken: session.refreshToken });
  await saveUser(session.usuario);
  return session.usuario;
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  return startSession(await api.login(email.trim(), password));
}

export async function signUp(email: string, password: string): Promise<SessionUser> {
  return startSession(await api.register(email.trim(), password));
}

// Al cerrar sesion se borran los tokens y los datos guardados,
// para que otra persona en el mismo telefono no vea los grupos.
export async function signOut(): Promise<void> {
  await tokenStore.clear();
  await clearAll(await getDatabase());
}

// Revisa el formulario de login y registro. Devuelve el mensaje de error, o null si esta bien.
export function validateCredentials(email: string, password: string): string | null {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return "Escribe un correo valido";
  }
  if (password.length < 8) {
    return "La contrasena debe tener al menos 8 caracteres";
  }
  return null;
}
