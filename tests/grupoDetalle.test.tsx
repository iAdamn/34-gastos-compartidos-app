import NetInfo, { NetInfoStateType, type NetInfoState } from "@react-native-community/netinfo";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Grupo from "../app/grupo/[id]";
import { useSession } from "@/providers/SessionProvider";
import { loadGroupDetail } from "@/services/groupsService";
import { syncGroupNow } from "@/services/sync";

import { makeDetail, makeExpense } from "./helpers/groupFixture";

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");
  return {
    useLocalSearchParams: () => ({ id: "g1" }),
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});
jest.mock("@react-native-community/netinfo", () =>
  jest.requireActual("@react-native-community/netinfo/jest/netinfo-mock.js"),
);
// QR de mentira para revisar que recibe solo el codigo.
const mockQr = jest.fn((_props: { value: string }) => null);
jest.mock("react-native-qrcode-svg", () => (props: { value: string }) => mockQr(props));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({ loadGroupDetail: jest.fn() }));
jest.mock("@/services/sync", () => ({ syncGroupNow: jest.fn() }));
jest.mock("@/services/expensesService", () => ({
  canDelete: jest.fn(() => false),
  deleteExpense: jest.fn(),
  addPayment: jest.fn(),
}));

const mockLoad = jest.mocked(loadGroupDetail);
const mockSync = jest.mocked(syncGroupNow);
const mockListen = jest.mocked(NetInfo.addEventListener);

// Simula un cambio de red como lo enviaria NetInfo.
function netState(isConnected: boolean): NetInfoState {
  return {
    type: NetInfoStateType.unknown,
    isConnected,
    isInternetReachable: null,
    details: null,
  };
}

function lastNetListener(): (state: NetInfoState) => void {
  const call = mockListen.mock.calls.at(-1);
  if (!call) {
    throw new Error("NetInfo no tiene listener");
  }
  return call[0];
}

// Como en app/_layout.tsx, los gestos de la lista necesitan GestureHandlerRootView alrededor.
function renderGroup() {
  return render(<Grupo />, { wrapper: GestureHandlerRootView });
}

describe("Pantalla del grupo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    mockSync.mockResolvedValue(true);
    mockListen.mockReturnValue(jest.fn());
  });

  it("muestra cargando mientras lee", async () => {
    mockLoad.mockReturnValue(new Promise(() => undefined));
    await renderGroup();
    expect(screen.getByText("Cargando...")).toBeTruthy();
  });

  it("muestra gastos, balance y pagos sugeridos", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    expect(await screen.findByText("Viaje a Cartagena")).toBeTruthy();
    expect(screen.getByText("Mercado")).toBeTruthy();
    expect(screen.getByText("$20.000,00 · pago Ana")).toBeTruthy();
    expect(screen.getByText("Ana: le deben $10.000,00")).toBeTruthy();
    expect(screen.getByText("Beto: debe $10.000,00")).toBeTruthy();
    expect(screen.getByText("Beto le paga a Ana $10.000,00")).toBeTruthy();
  });

  it("marca los gastos pendientes de envio", async () => {
    mockLoad.mockResolvedValue(makeDetail({ expenses: [makeExpense({ pending: true })] }));
    await renderGroup();
    expect(await screen.findByText("Pendiente de envio")).toBeTruthy();
  });

  it("sin gastos muestra el estado vacio y nadie debe", async () => {
    mockLoad.mockResolvedValue(
      makeDetail({ expenses: [], balances: { u1: 0, u2: 0 }, suggested: [] }),
    );
    await renderGroup();
    expect(await screen.findByText("Todavia no hay gastos")).toBeTruthy();
    expect(screen.getByText("Nadie le debe a nadie")).toBeTruthy();
  });

  it("si la lectura falla muestra el error y deja reintentar", async () => {
    mockLoad.mockRejectedValue(new Error("fallo"));
    await renderGroup();
    expect(await screen.findByText("No se pudo cargar el grupo")).toBeTruthy();
    mockLoad.mockResolvedValue(makeDetail());
    await fireEvent.press(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Mercado")).toBeTruthy();
  });

  it("si el grupo no esta en el telefono lo dice", async () => {
    mockLoad.mockResolvedValue(null);
    await renderGroup();
    expect(await screen.findByText("Grupo no encontrado")).toBeTruthy();
  });

  it("busca gastos por descripcion", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    await fireEvent.changeText(screen.getByLabelText("Buscar gasto"), "taxi");
    expect(mockLoad).toHaveBeenLastCalledWith("g1", "taxi");
  });

  it("si la busqueda no encuentra nada lo dice", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    mockLoad.mockResolvedValue(makeDetail({ expenses: [] }));
    await fireEvent.changeText(screen.getByLabelText("Buscar gasto"), "taxi");
    expect(await screen.findByText("Ningun gasto coincide con la busqueda")).toBeTruthy();
  });

  it("sincroniza al abrir", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    expect(mockSync).toHaveBeenCalledWith("g1");
    expect(screen.queryByText("Sin conexion, mostrando datos guardados")).toBeNull();
  });

  it("sin conexion avisa que muestra lo guardado", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    mockSync.mockResolvedValue(false);
    await renderGroup();
    expect(await screen.findByText("Sin conexion, mostrando datos guardados")).toBeTruthy();
  });

  it("sincroniza otra vez cuando vuelve la conexion", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    const callsAfterOpen = mockSync.mock.calls.length;
    await act(async () => lastNetListener()(netState(false)));
    expect(mockSync).toHaveBeenCalledTimes(callsAfterOpen);
    await act(async () => lastNetListener()(netState(true)));
    expect(mockSync).toHaveBeenCalledTimes(callsAfterOpen + 1);
  });

  it("deja de escuchar la red al salir de la pantalla", async () => {
    const unsubscribe = jest.fn();
    mockListen.mockReturnValue(unsubscribe);
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    await screen.unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("muestra el QR del grupo, que lleva solo el codigo", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    expect(await screen.findByLabelText("Codigo QR del grupo. Codigo ABC123")).toBeTruthy();
    expect(mockQr).toHaveBeenCalledWith(expect.objectContaining({ value: "ABC123" }));
  });

  it("el boton de nuevo gasto abre el formulario con el grupo", async () => {
    mockLoad.mockResolvedValue(makeDetail());
    await renderGroup();
    await screen.findByText("Mercado");
    await fireEvent.press(screen.getByRole("button", { name: "Registrar gasto" }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/gasto/nuevo", params: { gid: "g1" } });
  });
});
