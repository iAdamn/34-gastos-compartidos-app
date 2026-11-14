import { render, screen } from "@testing-library/react-native";
import { Text as MockText } from "react-native";

import RootLayout from "../app/_layout";
import { useSession } from "@/providers/SessionProvider";

// Stack de mentira: Protected solo muestra sus pantallas si guard es true.
jest.mock("expo-router", () => {
  function Stack({ children }: { children: unknown }) {
    return children;
  }
  Stack.Screen = function MockScreen({ name }: { name: string }) {
    return <MockText>{name}</MockText>;
  };
  Stack.Protected = function MockProtected({
    guard,
    children,
  }: {
    guard: boolean;
    children: unknown;
  }) {
    return guard ? children : null;
  };
  return { Stack };
});
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: unknown }) => children,
}));
jest.mock("@/api/api", () => ({ onSessionExpired: jest.fn() }));
jest.mock("@/services/session", () => ({ loadUser: jest.fn() }));
jest.mock("@/providers/SessionProvider", () => ({
  SessionProvider: ({ children }: { children: unknown }) => children,
  useSession: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const actions = { signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn() };

describe("layout raiz", () => {
  it("sin sesion solo se ven login y registro", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: false, ...actions });
    await render(<RootLayout />);
    expect(screen.getByText("(auth)")).toBeTruthy();
    expect(screen.queryByText("(tabs)")).toBeNull();
    expect(screen.queryByText("unirse")).toBeNull();
  });

  it("con sesion se ven las pantallas privadas", async () => {
    mockUseSession.mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      ...actions,
    });
    await render(<RootLayout />);
    expect(screen.getByText("(tabs)")).toBeTruthy();
    expect(screen.getByText("grupo/nuevo")).toBeTruthy();
    expect(screen.getByText("grupo/[id]")).toBeTruthy();
    expect(screen.getByText("gasto/nuevo")).toBeTruthy();
    expect(screen.queryByText("(auth)")).toBeNull();
  });

  it("mientras carga la sesion muestra el estado cargando", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: true, ...actions });
    await render(<RootLayout />);
    expect(screen.getByText("Cargando...")).toBeTruthy();
    expect(screen.queryByText("(auth)")).toBeNull();
  });
});
