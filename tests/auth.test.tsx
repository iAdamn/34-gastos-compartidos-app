import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import Login from "../app/(auth)/login";
import Registro from "../app/(auth)/registro";
import { useSession } from "@/providers/SessionProvider";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));

const mockUseSession = jest.mocked(useSession);
const signIn = jest.fn();
const signUp = jest.fn();

async function fill(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText("Correo"), email);
  await fireEvent.changeText(screen.getByLabelText("Contrasena"), password);
}

describe("pantallas de acceso", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      user: null,
      loading: false,
      signIn,
      signUp,
      signOut: jest.fn(),
    });
  });

  it("login valida el formulario y no llama a la API si esta mal", async () => {
    await render(<Login />);
    await fill("correo-malo", "12345678");
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Escribe un correo valido")).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("login envia los datos", async () => {
    signIn.mockResolvedValue(undefined);
    await render(<Login />);
    await fill("ana@correo.com", "12345678");
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith("ana@correo.com", "12345678"));
  });

  it("login muestra el mensaje de error de la API", async () => {
    signIn.mockRejectedValue(new Error("Correo o contrasena incorrectos"));
    await render(<Login />);
    await fill("ana@correo.com", "12345678");
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Correo o contrasena incorrectos")).toBeTruthy();
  });

  it("login lleva al registro", async () => {
    await render(<Login />);
    await fireEvent.press(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(mockPush).toHaveBeenCalledWith("/registro");
  });

  it("registro valida la contrasena corta", async () => {
    await render(<Registro />);
    await fill("ana@correo.com", "123");
    await fireEvent.press(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByText("La contrasena debe tener al menos 8 caracteres")).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("registro muestra el error de la API", async () => {
    signUp.mockRejectedValue(new Error("Ese correo ya esta registrado"));
    await render(<Registro />);
    await fill("ana@correo.com", "12345678");
    await fireEvent.press(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(await screen.findByText("Ese correo ya esta registrado")).toBeTruthy();
  });
});
