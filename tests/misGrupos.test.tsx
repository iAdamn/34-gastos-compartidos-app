import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text as MockText } from "react-native";

import TabsLayout from "../app/(tabs)/_layout";
import MisGrupos from "../app/(tabs)/index";
import { useSession } from "@/providers/SessionProvider";
import { listLocalGroups } from "@/services/groupsService";
import { syncEverything } from "@/services/sync";

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");
  function Tabs({ children }: { children: unknown }) {
    return children;
  }
  Tabs.Screen = function MockScreen({ options }: { options: { title: string } }) {
    return <MockText>{options.title}</MockText>;
  };
  return {
    Tabs,
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({ listLocalGroups: jest.fn() }));
jest.mock("@/services/sync", () => ({ syncEverything: jest.fn() }));

const mockList = jest.mocked(listLocalGroups);
const mockSync = jest.mocked(syncEverything);
const mockUseSession = jest.mocked(useSession);
const signOut = jest.fn();

const cena = { id: "g1", nombre: "Viaje a Cartagena", codigo: "ABC123", creador_uid: "u1" };

describe("Mis grupos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut,
    });
  });

  it("muestra los grupos guardados y sincroniza al abrir", async () => {
    mockList.mockResolvedValue([cena]);
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    expect(await screen.findByText("Viaje a Cartagena")).toBeTruthy();
    expect(screen.getByText("Codigo: ABC123")).toBeTruthy();
    expect(mockSync).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Sin conexion, mostrando datos guardados")).toBeNull();
  });

  it("sin conexion avisa y muestra lo guardado", async () => {
    mockList.mockResolvedValue([cena]);
    mockSync.mockResolvedValue(false);
    await render(<MisGrupos />);
    expect(await screen.findByText("Sin conexion, mostrando datos guardados")).toBeTruthy();
    expect(screen.getByText("Viaje a Cartagena")).toBeTruthy();
  });

  it("sin grupos muestra el estado vacio", async () => {
    mockList.mockResolvedValue([]);
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    expect(await screen.findByText("Todavia no tienes grupos")).toBeTruthy();
  });

  it("si falla la lectura muestra el error", async () => {
    mockList.mockRejectedValue(new Error("fallo"));
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    expect(await screen.findByText("No se pudieron cargar tus grupos")).toBeTruthy();
  });

  it("los botones llevan a crear y a unirse", async () => {
    mockList.mockResolvedValue([]);
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    await screen.findByText("Todavia no tienes grupos");
    await fireEvent.press(screen.getByRole("button", { name: "Crear grupo" }));
    expect(mockPush).toHaveBeenCalledWith("/grupo/nuevo");
    await fireEvent.press(screen.getByRole("button", { name: "Unirme a un grupo" }));
    expect(mockPush).toHaveBeenCalledWith("/unirse");
  });

  it("tocar un grupo abre su pantalla", async () => {
    mockList.mockResolvedValue([cena]);
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    await fireEvent.press(await screen.findByRole("button", { name: "Abrir Viaje a Cartagena" }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/grupo/[id]", params: { id: "g1" } });
  });

  it("cerrar sesion llama a signOut", async () => {
    mockList.mockResolvedValue([]);
    mockSync.mockResolvedValue(true);
    await render(<MisGrupos />);
    await screen.findByText("Todavia no tienes grupos");
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar sesion" }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe("layout de pestanas", () => {
  it("declara la pestana Mis grupos", async () => {
    await render(<TabsLayout />);
    expect(screen.getByText("Mis grupos")).toBeTruthy();
  });
});
