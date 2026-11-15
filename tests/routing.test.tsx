import { renderRouter, screen } from "expo-router/testing-library";
import { Text } from "react-native";

import RootLayout from "../app/_layout";
import AuthLayout from "../app/(auth)/_layout";
import NotFound from "../app/+not-found";
import { useSession } from "@/providers/SessionProvider";

// Router real de Expo con las rutas de la app; las pantallas son de mentira.
// Sirve para revisar a donde llega la app al abrirse, con y sin sesion.
jest.mock("@/providers/SessionProvider", () => ({
  SessionProvider: ({ children }: { children: unknown }) => children,
  useSession: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const actions = { signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn() };
const user = { id: "u1", email: "ana@example.com" };

function screenWith(text: string) {
  return function MockScreen() {
    return <Text>{text}</Text>;
  };
}

function appRoutes() {
  return {
    _layout: RootLayout,
    "(auth)/_layout": AuthLayout,
    "(auth)/login": screenWith("Pantalla login"),
    "(auth)/registro": screenWith("Pantalla registro"),
    "(tabs)/index": screenWith("Pantalla mis grupos"),
    "grupo/nuevo": screenWith("Pantalla nuevo grupo"),
    "grupo/[id]": screenWith("Pantalla grupo"),
    "gasto/nuevo": screenWith("Pantalla nuevo gasto"),
    unirse: screenWith("Pantalla unirse"),
    "+not-found": NotFound,
  };
}

describe("rutas al abrir la app", () => {
  it("sin sesion, abrir la raiz lleva al login", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: false, ...actions });
    await renderRouter(appRoutes(), { initialUrl: "/" });
    expect(await screen.findByText("Pantalla login")).toBeOnTheScreen();
  });

  it("con sesion, abrir la raiz muestra mis grupos", async () => {
    mockUseSession.mockReturnValue({ user, loading: false, ...actions });
    await renderRouter(appRoutes(), { initialUrl: "/" });
    expect(await screen.findByText("Pantalla mis grupos")).toBeOnTheScreen();
  });

  it("sin sesion, una pantalla protegida tambien lleva al login", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: false, ...actions });
    await renderRouter(appRoutes(), { initialUrl: "/unirse" });
    expect(await screen.findByText("Pantalla login")).toBeOnTheScreen();
  });

  it("con sesion, una ruta que no existe ofrece volver a mis grupos", async () => {
    mockUseSession.mockReturnValue({ user, loading: false, ...actions });
    await renderRouter(appRoutes(), { initialUrl: "/no-existe" });
    expect(await screen.findByText("Pantalla no encontrada")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Ir a mis grupos" })).toBeOnTheScreen();
  });
});
