import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Grupo from "../app/grupo/[id]";
import { useSession } from "@/providers/SessionProvider";
import { vibrateSuccess } from "@/sensors/haptics";
import { addPayment } from "@/services/expensesService";
import { loadGroupDetail } from "@/services/groupsService";
import { syncGroupNow } from "@/services/sync";

import { makeDetail } from "./helpers/groupFixture";

jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");
  return {
    useLocalSearchParams: () => ({ id: "g1" }),
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("@react-native-community/netinfo", () =>
  jest.requireActual("@react-native-community/netinfo/jest/netinfo-mock.js"),
);
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({ loadGroupDetail: jest.fn() }));
jest.mock("@/services/sync", () => ({ syncGroupNow: jest.fn() }));
jest.mock("@/services/expensesService", () => ({
  canDelete: jest.fn(() => false),
  deleteExpense: jest.fn(),
  addPayment: jest.fn(),
}));

const mockPay = jest.mocked(addPayment);
const mockVibrate = jest.mocked(Haptics.notificationAsync);

async function openConfirm() {
  await render(<Grupo />, { wrapper: GestureHandlerRootView });
  await fireEvent.press(
    await screen.findByRole("button", { name: "Registrar pago de Beto a Ana" }),
  );
}

describe("vibrar al confirmar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("devuelve true si el telefono vibro", async () => {
    mockVibrate.mockResolvedValue();
    await expect(vibrateSuccess()).resolves.toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith("success");
  });

  it("devuelve false sin romperse si no hay vibracion", async () => {
    mockVibrate.mockRejectedValue(new Error("no disponible"));
    await expect(vibrateSuccess()).resolves.toBe(false);
  });
});

describe("registrar un pago sugerido", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    jest.mocked(syncGroupNow).mockResolvedValue(true);
    jest.mocked(loadGroupDetail).mockResolvedValue(makeDetail());
    mockPay.mockResolvedValue();
    mockVibrate.mockResolvedValue();
  });

  it("pide confirmar antes de registrar", async () => {
    await openConfirm();
    expect(screen.getByText("Confirma que Beto le pago $10.000,00 a Ana")).toBeTruthy();
    expect(mockPay).not.toHaveBeenCalled();
  });

  it("al confirmar registra el pago, vibra y lo dice en pantalla", async () => {
    await openConfirm();
    await fireEvent.press(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(mockPay).toHaveBeenCalledWith("g1", "u2", "u1", 1000000);
    expect(mockVibrate).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Pago registrado")).toBeTruthy();
  });

  it("sin vibracion igual muestra el mensaje", async () => {
    mockVibrate.mockRejectedValue(new Error("no disponible"));
    await openConfirm();
    await fireEvent.press(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(await screen.findByText("Pago registrado")).toBeTruthy();
  });

  it("cancelar no registra nada", async () => {
    await openConfirm();
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText("Confirma que Beto le pago $10.000,00 a Ana")).toBeNull();
    expect(mockPay).not.toHaveBeenCalled();
  });

  it("si el pago falla muestra el error y no vibra", async () => {
    mockPay.mockRejectedValue(new Error("Pago invalido"));
    await openConfirm();
    await fireEvent.press(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(await screen.findByText("Pago invalido")).toBeTruthy();
    expect(mockVibrate).not.toHaveBeenCalled();
  });
});
