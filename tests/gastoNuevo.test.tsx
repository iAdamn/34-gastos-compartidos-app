import { fireEvent, render, screen } from "@testing-library/react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import NuevoGasto from "../app/gasto/nuevo";
import { useSession } from "@/providers/SessionProvider";
import { addExpense, validateExpenseForm } from "@/services/expensesService";
import { loadGroupDetail } from "@/services/groupsService";

import { makeDetail } from "./helpers/groupFixture";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ gid: "g1" }),
  useRouter: () => ({ back: mockBack }),
}));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({ loadGroupDetail: jest.fn() }));
jest.mock("@/services/expensesService", () => ({
  addExpense: jest.fn(),
  validateExpenseForm: jest.fn(),
}));

const mockAdd = jest.mocked(addExpense);
const mockValidate = jest.mocked(validateExpenseForm);

async function renderForm() {
  await render(<NuevoGasto />, { wrapper: GestureHandlerRootView });
  await screen.findByLabelText("Participa Beto");
}

async function fillAndSave() {
  await fireEvent.changeText(screen.getByLabelText("Descripcion"), "Taxi");
  await fireEvent.changeText(screen.getByLabelText("Monto en pesos"), "30000");
  await fireEvent.press(screen.getByRole("button", { name: "Guardar gasto" }));
}

function isChecked(label: string): boolean | "mixed" | undefined {
  return screen.getByLabelText(label).props.accessibilityState?.checked;
}

describe("Registrar gasto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    jest.mocked(loadGroupDetail).mockResolvedValue(makeDetail());
    mockValidate.mockReturnValue(null);
    mockAdd.mockResolvedValue();
  });

  it("por defecto pago yo y participan todos en partes iguales", async () => {
    await renderForm();
    expect(isChecked("Participa Ana")).toBe(true);
    expect(isChecked("Participa Beto")).toBe(true);
    await fillAndSave();
    expect(mockAdd).toHaveBeenCalledWith("g1", "u1", {
      descripcion: "Taxi",
      pesos: "30000",
      pagador_uid: "u1",
      participantes: ["u1", "u2"],
      porcentajes: null,
    });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("la casilla quita a un participante", async () => {
    await renderForm();
    await fireEvent.press(screen.getByLabelText("Participa Beto"));
    expect(isChecked("Participa Beto")).toBe(false);
    await fillAndSave();
    expect(mockAdd.mock.calls[0]?.[2].participantes).toEqual(["u1"]);
  });

  it("mantener presionado un miembro lo marca o desmarca", async () => {
    await renderForm();
    fireGestureHandler(getByGestureTestId("mantener-u2"), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);
    expect(await screen.findByLabelText("Participa Beto")).toBeTruthy();
    expect(isChecked("Participa Beto")).toBe(false);
  });

  it("se puede elegir quien pago", async () => {
    await renderForm();
    await fireEvent.press(screen.getByRole("radio", { name: "Pago Beto" }));
    await fillAndSave();
    expect(mockAdd.mock.calls[0]?.[2].pagador_uid).toBe("u2");
  });

  it("por porcentajes con botones + y -", async () => {
    await renderForm();
    await fireEvent.press(screen.getByRole("radio", { name: "Porcentajes" }));
    expect(screen.getByText("Ana: 50 %")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Subir porcentaje de Ana" }));
    await fireEvent.press(screen.getByRole("button", { name: "Bajar porcentaje de Beto" }));
    expect(screen.getByText("Ana: 55 %")).toBeTruthy();
    expect(screen.getByText("Suma: 100 %")).toBeTruthy();
    await fillAndSave();
    expect(mockAdd.mock.calls[0]?.[2].porcentajes).toEqual({ u1: 55, u2: 45 });
  });

  it("si el formulario esta mal muestra el error y no guarda", async () => {
    mockValidate.mockReturnValue("Escribe el monto en pesos, sin centavos");
    await renderForm();
    await fillAndSave();
    expect(screen.getByText("Escribe el monto en pesos, sin centavos")).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it("si guardar falla muestra el error", async () => {
    mockAdd.mockRejectedValue(new Error("Monto invalido"));
    await renderForm();
    await fillAndSave();
    expect(await screen.findByText("Monto invalido")).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("si no puede leer el grupo muestra el error", async () => {
    jest.mocked(loadGroupDetail).mockResolvedValue(null);
    await render(<NuevoGasto />, { wrapper: GestureHandlerRootView });
    expect(await screen.findByText("No se pudo cargar el grupo")).toBeTruthy();
  });
});
