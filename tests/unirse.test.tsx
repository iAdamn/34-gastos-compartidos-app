import { fireEvent, render, screen } from "@testing-library/react-native";

import Unirse from "../app/unirse";
import { ApiClientError } from "@/api/client";
import { useSession } from "@/providers/SessionProvider";
import { joinGroup, validateJoinForm } from "@/services/groupsService";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: mockBack }) }));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({
  joinGroup: jest.fn(),
  validateJoinForm: jest.fn(),
}));

const mockJoin = jest.mocked(joinGroup);
const mockValidate = jest.mocked(validateJoinForm);

async function fill(codigo: string, miNombre: string) {
  await fireEvent.changeText(screen.getByLabelText("Codigo del grupo"), codigo);
  await fireEvent.changeText(screen.getByLabelText("Tu nombre"), miNombre);
}

describe("Unirse a un grupo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    mockValidate.mockReturnValue(null);
  });

  it("deja un lugar para el boton de escanear QR", async () => {
    await render(<Unirse />);
    expect(screen.getByRole("button", { name: "Escanear codigo QR" })).toBeTruthy();
  });

  it("no llama a la API si el codigo esta mal", async () => {
    mockValidate.mockReturnValue("El codigo tiene 6 letras o numeros");
    await render(<Unirse />);
    await fill("AB", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Unirme" }));
    expect(screen.getByText("El codigo tiene 6 letras o numeros")).toBeTruthy();
    expect(mockJoin).not.toHaveBeenCalled();
  });

  it("se une y vuelve a la pantalla anterior", async () => {
    mockJoin.mockResolvedValue({ id: "g1", nombre: "Viaje", codigo: "ABC123", creador_uid: "u2" });
    await render(<Unirse />);
    await fill("abc123", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Unirme" }));
    await screen.findByRole("button", { name: "Unirme" });
    expect(mockJoin).toHaveBeenCalledWith("abc123", "Ana");
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("con 404 muestra Grupo no encontrado", async () => {
    mockJoin.mockRejectedValue(new ApiClientError(404, "No existe"));
    await render(<Unirse />);
    await fill("ZZZ999", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Unirme" }));
    expect(await screen.findByText("Grupo no encontrado")).toBeTruthy();
  });

  it("con otro error muestra el mensaje de la API", async () => {
    mockJoin.mockRejectedValue(new ApiClientError(409, "El grupo esta lleno"));
    await render(<Unirse />);
    await fill("ABC123", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Unirme" }));
    expect(await screen.findByText("El grupo esta lleno")).toBeTruthy();
  });
});
