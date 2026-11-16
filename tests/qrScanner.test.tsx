import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Camera, CameraView, PermissionStatus, type PermissionResponse } from "expo-camera";

import Unirse from "../app/unirse";
import { useSession } from "@/providers/SessionProvider";
import { parseGroupQr } from "@/sensors/useQrScanner";

jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock("@/providers/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/services/groupsService", () => ({
  joinGroup: jest.fn(),
  validateJoinForm: jest.fn(() => null),
}));
// Camara de mentira: un View que guarda sus props para poder simular un QR leido.
jest.mock("expo-camera", () => {
  const { View } = jest.requireActual("react-native");
  function MockCameraView(props: object) {
    return <View testID="camara-qr" {...props} />;
  }
  MockCameraView.isAvailableAsync = jest.fn();
  return {
    CameraView: MockCameraView,
    Camera: { requestCameraPermissionsAsync: jest.fn() },
    PermissionStatus: jest.requireActual("expo").PermissionStatus,
  };
});

const mockAvailable = jest.mocked(CameraView.isAvailableAsync);
const mockPermission = jest.mocked(Camera.requestCameraPermissionsAsync);

function permission(granted: boolean): PermissionResponse {
  return {
    granted,
    status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
    canAskAgain: true,
    expires: "never",
  };
}

async function startScanner() {
  await render(<Unirse />);
  await fireEvent.press(screen.getByRole("button", { name: "Escanear codigo QR" }));
}

// Simula que la camara leyo un QR con el texto indicado.
async function scan(data: string) {
  const camera = screen.getByTestId("camara-qr");
  await act(async () => camera.props.onBarcodeScanned({ data, type: "qr" }));
}

describe("leer el QR de un grupo", () => {
  it("acepta solo un codigo de grupo valido", () => {
    expect(parseGroupQr(" abc234 ")).toBe("ABC234");
    expect(parseGroupQr("https://ejemplo.com")).toBeNull();
    expect(parseGroupQr("ABC123")).toBeNull();
  });
});

describe("escanear desde Unirse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: "u1", email: "ana@correo.com" },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    mockAvailable.mockResolvedValue(true);
    mockPermission.mockResolvedValue(permission(true));
  });

  it("en Android y iOS, donde isAvailableAsync no existe y lanza error, igual abre la camara", async () => {
    // Asi responde expo-camera en un telefono: el metodo solo esta hecho para web.
    mockAvailable.mockRejectedValue(new Error("expo-camera.isAvailableAsync is not available"));

    await startScanner();

    expect(mockPermission).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId("camara-qr")).toBeTruthy();
  });

  it("explica para que es la camara y no pide permiso al abrir", async () => {
    await render(<Unirse />);
    expect(screen.getByText("La camara solo se usa para leer el QR del grupo")).toBeTruthy();
    expect(mockPermission).not.toHaveBeenCalled();
  });

  it("revisa la camara, pide permiso al tocar el boton y llena el codigo al leer", async () => {
    await startScanner();
    expect(mockAvailable).toHaveBeenCalled();
    expect(mockPermission).toHaveBeenCalledTimes(1);
    await scan("abc234");
    expect(screen.getByLabelText("Codigo del grupo").props.value).toBe("ABC234");
    expect(screen.queryByTestId("camara-qr")).toBeNull();
  });

  it("un QR que no es de un grupo se avisa y la camara sigue abierta", async () => {
    await startScanner();
    await scan("https://ejemplo.com");
    expect(screen.getByText("Ese QR no es de un grupo")).toBeTruthy();
    expect(screen.getByTestId("camara-qr")).toBeTruthy();
  });

  it("sin camara no pide permiso y deja escribir el codigo", async () => {
    mockAvailable.mockResolvedValue(false);
    await startScanner();
    expect(
      await screen.findByText("Este telefono no tiene camara. Escribe el codigo."),
    ).toBeTruthy();
    expect(mockPermission).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Codigo del grupo")).toBeTruthy();
  });

  // Antes esta prueba hacia fallar isAvailableAsync y esperaba "no tiene camara". Eso daba por
  // bueno un error: en un telefono ese metodo siempre falla. El caso real de fallo es el permiso.
  it("si pedir el permiso de la camara falla no se rompe", async () => {
    mockPermission.mockRejectedValue(new Error("modulo nativo"));
    await startScanner();
    expect(
      await screen.findByText("Este telefono no tiene camara. Escribe el codigo."),
    ).toBeTruthy();
  });

  it("sin permiso lo dice y no abre la camara", async () => {
    mockPermission.mockResolvedValue(permission(false));
    await startScanner();
    expect(
      await screen.findByText("Sin permiso de camara. Puedes escribir el codigo."),
    ).toBeTruthy();
    expect(screen.queryByTestId("camara-qr")).toBeNull();
  });

  it("se puede cerrar la camara sin leer nada", async () => {
    await startScanner();
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar camara" }));
    expect(screen.queryByTestId("camara-qr")).toBeNull();
  });
});
