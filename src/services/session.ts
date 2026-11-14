import * as SecureStore from "expo-secure-store";

import type { TokenStore, Tokens } from "@/api/client";
import type { SessionUser } from "@/types";

// La sesion se guarda en expo-secure-store (Keychain o Keystore), nunca en AsyncStorage.
const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "usuario";

export const tokenStore: TokenStore = {
  async get(): Promise<Tokens | null> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    return token && refreshToken ? { token, refreshToken } : null;
  },
  async set(tokens: Tokens): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, tokens.token);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

export async function saveUser(user: SessionUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

// Usuario de la sesion guardada, o null si no hay sesion.
export async function loadUser(): Promise<SessionUser | null> {
  const saved = await SecureStore.getItemAsync(USER_KEY);
  const tokens = await tokenStore.get();
  if (!saved || !tokens) {
    return null;
  }
  const user: { id?: unknown; email?: unknown } = JSON.parse(saved);
  return { id: String(user.id), email: String(user.email) };
}
