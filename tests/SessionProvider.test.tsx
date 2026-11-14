import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

import { onSessionExpired } from "@/api/api";
import { SessionProvider, useSession } from "@/providers/SessionProvider";
import * as authService from "@/services/authService";
import { loadUser } from "@/services/session";

jest.mock("@/api/api", () => ({ onSessionExpired: jest.fn() }));
jest.mock("@/services/session", () => ({ loadUser: jest.fn() }));
jest.mock("@/services/authService", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}));

const mockLoadUser = jest.mocked(loadUser);
const mockSignIn = jest.mocked(authService.signIn);
const mockSignOut = jest.mocked(authService.signOut);
const mockOnExpired = jest.mocked(onSessionExpired);

const ana = { id: "u1", email: "ana@correo.com" };

// Componente de prueba: muestra el usuario y tiene botones que llaman las acciones.
function Probe() {
  const { user, loading, signIn, signOut } = useSession();
  if (loading) {
    return <Text>cargando</Text>;
  }
  return (
    <>
      <Text>{user ? user.email : "sin sesion"}</Text>
      <Pressable onPress={() => signIn("ana@correo.com", "12345678")}>
        <Text>entrar</Text>
      </Pressable>
      <Pressable onPress={() => signOut()}>
        <Text>salir</Text>
      </Pressable>
    </>
  );
}

async function renderProvider() {
  await render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
}

describe("SessionProvider", () => {
  beforeEach(() => jest.clearAllMocks());

  it("carga la sesion guardada al abrir", async () => {
    mockLoadUser.mockResolvedValue(ana);
    await renderProvider();
    expect(await screen.findByText("ana@correo.com")).toBeTruthy();
  });

  it("sin sesion guardada el usuario es null", async () => {
    mockLoadUser.mockResolvedValue(null);
    await renderProvider();
    expect(await screen.findByText("sin sesion")).toBeTruthy();
  });

  it("signIn guarda el usuario", async () => {
    mockLoadUser.mockResolvedValue(null);
    mockSignIn.mockResolvedValue(ana);
    await renderProvider();
    await screen.findByText("sin sesion");
    await fireEvent.press(screen.getByText("entrar"));
    expect(await screen.findByText("ana@correo.com")).toBeTruthy();
  });

  it("signOut borra el usuario", async () => {
    mockLoadUser.mockResolvedValue(ana);
    mockSignOut.mockResolvedValue();
    await renderProvider();
    await screen.findByText("ana@correo.com");
    await fireEvent.press(screen.getByText("salir"));
    expect(await screen.findByText("sin sesion")).toBeTruthy();
  });

  it("al vencer la sesion vuelve al login", async () => {
    mockLoadUser.mockResolvedValue(ana);
    await renderProvider();
    await screen.findByText("ana@correo.com");
    const handler = mockOnExpired.mock.calls[0]?.[0];
    await act(async () => {
      handler?.();
    });
    expect(await screen.findByText("sin sesion")).toBeTruthy();
  });
});
