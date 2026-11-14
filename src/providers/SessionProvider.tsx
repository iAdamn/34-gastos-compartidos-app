import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { onSessionExpired } from "@/api/api";
import * as authService from "@/services/authService";
import { loadUser } from "@/services/session";
import type { SessionUser } from "@/types";

type SessionValue = {
  user: SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app se lee la sesion guardada.
  useEffect(() => {
    loadUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Si la API dice que la sesion vencio, se quita el usuario y las rutas protegidas llevan al login.
  useEffect(() => {
    onSessionExpired(() => setUser(null));
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => setUser(await authService.signIn(email, password)),
      signUp: async (email, password) => setUser(await authService.signUp(email, password)),
      signOut: async () => {
        await authService.signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession se usa dentro de SessionProvider");
  }
  return value;
}
