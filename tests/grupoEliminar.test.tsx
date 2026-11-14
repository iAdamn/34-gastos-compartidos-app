import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import Grupo from "../app/grupo/[id]";
import { isDeleteSwipe } from "@/components/group-detail/swipe";
import { useSession } from "@/providers/SessionProvider";
import { canDelete, deleteExpense } from "@/services/expensesService";
import { loadGroupDetail } from "@/services/groupsService";
import { syncGroupNow } from "@/services/sync";

import { makeDetail, makeExpense } from "./helpers/groupFixture";

jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");
  return {
    useLocalSearchParams: () => ({ id: "g1" }),
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});
jest.mock("@react-native-community/netinfo", () =>
  jest.requireActual("@react-native-community/netinfo/jest/netinfo-mock.js"),
);
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({ loadGroupDetail: jest.fn() }));
jest.mock("@/services/sync", () => ({ syncGroupNow: jest.fn() }));
jest.mock("@/services/expensesService", () => ({
  canDelete: jest.fn(),
  deleteExpense: jest.fn(),
  addPayment: jest.fn(),
}));

const mockDelete = jest.mocked(deleteExpense);
const mockCanDelete = jest.mocked(canDelete);
const mercado = makeExpense();

// Como en app/_layout.tsx, los gestos necesitan GestureHandlerRootView alrededor.
function renderGroup() {
  return render(<Grupo />, { wrapper: GestureHandlerRootView });
}

// Arrastra el gasto hacia la izquierda hasta la distancia indicada y lo suelta.
function swipe(translationX: number) {
  fireGestureHandler(getByGestureTestId("deslizar-e1"), [
    { state: State.BEGAN, translationX: 0 },
    { state: State.ACTIVE, translationX: translationX / 2 },
    { state: State.ACTIVE, translationX },
    { state: State.END, translationX },
  ]);
}

describe("decidir si un deslizamiento elimina", () => {
  it("elimina solo si se desliza lo suficiente a la izquierda", () => {
    expect(isDeleteSwipe(-150)).toBe(true);
    expect(isDeleteSwipe(-40)).toBe(false);
    expect(isDeleteSwipe(150)).toBe(false);
  });
});

describe("eliminar un gasto", () => {
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
    jest.mocked(loadGroupDetail).mockResolvedValue(makeDetail({ expenses: [mercado] }));
    mockDelete.mockResolvedValue();
  });

  it("quien lo creo lo elimina con el boton", async () => {
    mockCanDelete.mockReturnValue(true);
    await renderGroup();
    await fireEvent.press(await screen.findByRole("button", { name: "Eliminar gasto Mercado" }));
    expect(mockCanDelete).toHaveBeenCalledWith(mercado, "u1");
    expect(mockDelete).toHaveBeenCalledWith(mercado, "u1");
  });

  it("quien no lo creo no ve el boton", async () => {
    mockCanDelete.mockReturnValue(false);
    await renderGroup();
    await screen.findByText("Mercado");
    expect(screen.queryByRole("button", { name: "Eliminar gasto Mercado" })).toBeNull();
  });

  it("deslizar a la izquierda lo elimina", async () => {
    mockCanDelete.mockReturnValue(true);
    await renderGroup();
    await screen.findByText("Mercado");
    swipe(-150);
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(mercado, "u1"));
  });

  it("un deslizamiento corto no elimina", async () => {
    mockCanDelete.mockReturnValue(true);
    await renderGroup();
    await screen.findByText("Mercado");
    swipe(-40);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("si no lo creo, deslizar no hace nada", async () => {
    mockCanDelete.mockReturnValue(false);
    await renderGroup();
    await screen.findByText("Mercado");
    swipe(-150);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("si eliminar falla muestra el error", async () => {
    mockCanDelete.mockReturnValue(true);
    mockDelete.mockRejectedValue(new Error("Solo quien creo el gasto puede eliminarlo"));
    await renderGroup();
    await fireEvent.press(await screen.findByRole("button", { name: "Eliminar gasto Mercado" }));
    expect(await screen.findByText("Solo quien creo el gasto puede eliminarlo")).toBeTruthy();
  });
});
