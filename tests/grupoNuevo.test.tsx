import { fireEvent, render, screen } from "@testing-library/react-native";

import NuevoGrupo from "../app/grupo/nuevo";
import { useSession } from "@/providers/SessionProvider";
import { createGroup, validateGroupForm } from "@/services/groupsService";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: mockBack }) }));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({
  createGroup: jest.fn(),
  validateGroupForm: jest.fn(),
}));

const mockCreate = jest.mocked(createGroup);
const mockValidate = jest.mocked(validateGroupForm);

async function fill(nombre: string, miNombre: string) {
  await fireEvent.changeText(screen.getByLabelText("Nombre del grupo"), nombre);
  await fireEvent.changeText(screen.getByLabelText("Tu nombre"), miNombre);
}

describe("Crear grupo", () => {
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

  it("propone el nombre del correo como tu nombre", async () => {
    await render(<NuevoGrupo />);
    expect(screen.getByLabelText("Tu nombre").props.value).toBe("ana");
  });

  it("no crea el grupo si el formulario esta mal", async () => {
    mockValidate.mockReturnValue("Tu nombre debe tener entre 1 y 30 caracteres");
    await render(<NuevoGrupo />);
    await fill("Viaje", "");
    await fireEvent.press(screen.getByRole("button", { name: "Crear grupo" }));
    expect(screen.getByText("Tu nombre debe tener entre 1 y 30 caracteres")).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("muestra el codigo al terminar", async () => {
    mockCreate.mockResolvedValue({
      id: "g1",
      nombre: "Viaje",
      codigo: "ABC123",
      creador_uid: "u1",
    });
    await render(<NuevoGrupo />);
    await fill("Viaje", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Crear grupo" }));
    expect(await screen.findByText("ABC123")).toBeTruthy();
    expect(screen.getByLabelText("Codigo QR del grupo. Codigo ABC123")).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledWith("Viaje", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Listo" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("muestra el error si falla la creacion", async () => {
    mockCreate.mockRejectedValue(new Error("Sin conexion"));
    await render(<NuevoGrupo />);
    await fill("Viaje", "Ana");
    await fireEvent.press(screen.getByRole("button", { name: "Crear grupo" }));
    expect(await screen.findByText("Sin conexion")).toBeTruthy();
  });
});
