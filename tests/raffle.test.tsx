import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { PermissionStatus, type PermissionResponse } from "expo";
import { Accelerometer } from "expo-sensors";

import { pickRandomMember } from "@/components/raffle/pickPayer";
import { Raffle } from "@/components/raffle/Raffle";
import { accelerationMagnitude, isShake, SHAKE_COOLDOWN_MS } from "@/sensors/shakeDetector";
import type { Member } from "@/types";

jest.mock("expo-sensors", () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

const mockAvailable = jest.mocked(Accelerometer.isAvailableAsync);
const mockPermission = jest.mocked(Accelerometer.requestPermissionsAsync);
const mockListen = jest.mocked(Accelerometer.addListener);
const remove = jest.fn();

const members: Member[] = [
  { uid: "u1", nombre: "Ana" },
  { uid: "u2", nombre: "Beto" },
];
const quiet = { x: 0, y: 0, z: 1, timestamp: 0 };
const strong = { x: 2, y: 2, z: 1, timestamp: 0 };

function granted(isGranted: boolean): PermissionResponse {
  return {
    granted: isGranted,
    status: isGranted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
    canAskAgain: true,
    expires: "never",
  };
}

// Envia una lectura del acelerometro al ultimo listener registrado.
async function emit(sample: typeof quiet) {
  const listener = mockListen.mock.calls.at(-1)?.[0];
  if (!listener) {
    throw new Error("No hay listener del acelerometro");
  }
  await act(async () => listener(sample));
}

async function activate() {
  await render(<Raffle members={members} random={() => 0.9} />);
  await fireEvent.press(screen.getByRole("button", { name: "Activar sacudir para sortear" }));
}

describe("detectar una sacudida (funcion pura)", () => {
  it("calcula la aceleracion total", () => {
    expect(accelerationMagnitude({ x: 0, y: 0, z: 1 })).toBe(1);
    expect(accelerationMagnitude({ x: 2, y: 2, z: 1 })).toBe(3);
  });

  it("el telefono quieto no es una sacudida", () => {
    expect(isShake(quiet, 5000, null)).toBe(false);
  });

  it("un movimiento fuerte es una sacudida", () => {
    expect(isShake(strong, 5000, null)).toBe(true);
  });

  it("no cuenta dos veces la misma sacudida", () => {
    expect(isShake(strong, 5000 + SHAKE_COOLDOWN_MS - 1, 5000)).toBe(false);
    expect(isShake(strong, 5000 + SHAKE_COOLDOWN_MS, 5000)).toBe(true);
  });
});

describe("sortear quien paga", () => {
  it("elige un miembro con el azar que recibe", () => {
    expect(pickRandomMember(members, () => 0)?.nombre).toBe("Ana");
    expect(pickRandomMember(members, () => 0.99)?.nombre).toBe("Beto");
    expect(pickRandomMember([], () => 0.5)).toBeUndefined();
  });
});

describe("componente Sortear", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAvailable.mockResolvedValue(true);
    mockPermission.mockResolvedValue(granted(true));
    mockListen.mockReturnValue({ remove });
  });

  it("el boton Sortear funciona sin sensor y sin pedir nada", async () => {
    await render(<Raffle members={members} random={() => 0} />);
    await fireEvent.press(screen.getByRole("button", { name: "Sortear" }));
    expect(screen.getByText("Paga la proxima: Ana")).toBeTruthy();
    expect(mockAvailable).not.toHaveBeenCalled();
    expect(mockPermission).not.toHaveBeenCalled();
  });

  it("cada sorteo se nota aunque salga la misma persona", async () => {
    await render(<Raffle members={[{ uid: "u1", nombre: "Ana" }]} />);
    await fireEvent.press(screen.getByRole("button", { name: "Sortear" }));
    expect(screen.getByText("Sorteo 1")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Sortear" }));
    expect(screen.getByText("Sorteo 2")).toBeTruthy();
    expect(screen.getByText("Paga la proxima: Ana")).toBeTruthy();
  });

  it("sin miembros avisa en vez de quedarse callado", async () => {
    await render(<Raffle members={[]} />);
    await fireEvent.press(screen.getByRole("button", { name: "Sortear" }));
    expect(screen.getByText("No hay miembros para sortear")).toBeTruthy();
  });

  it("explica para que se usa el acelerometro", async () => {
    await render(<Raffle members={members} />);
    expect(
      screen.getByText("El acelerometro solo se usa para notar cuando sacudes el telefono"),
    ).toBeTruthy();
  });

  it("al activar revisa el sensor, pide permiso y sortea al sacudir", async () => {
    await activate();
    expect(mockAvailable).toHaveBeenCalled();
    expect(mockPermission).toHaveBeenCalledTimes(1);
    await emit(quiet);
    expect(screen.queryByText(/Paga la proxima/)).toBeNull();
    await emit(strong);
    expect(screen.getByText("Paga la proxima: Beto")).toBeTruthy();
  });

  it("al desactivar cancela la suscripcion", async () => {
    await activate();
    await screen.findByRole("button", { name: "Desactivar sacudir" });
    await fireEvent.press(screen.getByRole("button", { name: "Desactivar sacudir" }));
    expect(remove).toHaveBeenCalled();
  });

  it("al salir de la pantalla cancela la suscripcion", async () => {
    await activate();
    await screen.findByRole("button", { name: "Desactivar sacudir" });
    await screen.unmount();
    expect(remove).toHaveBeenCalled();
  });

  it("sin acelerometro lo dice, no pide permiso y queda el boton", async () => {
    mockAvailable.mockResolvedValue(false);
    await activate();
    expect(
      await screen.findByText("Este telefono no tiene acelerometro. Usa el boton Sortear."),
    ).toBeTruthy();
    expect(mockPermission).not.toHaveBeenCalled();
    expect(mockListen).not.toHaveBeenCalled();
  });

  it("sin permiso lo dice y no escucha el sensor", async () => {
    mockPermission.mockResolvedValue(granted(false));
    await activate();
    expect(
      await screen.findByText("Sin permiso de movimiento. Usa el boton Sortear."),
    ).toBeTruthy();
    expect(mockListen).not.toHaveBeenCalled();
  });

  it("si el sensor falla no se rompe", async () => {
    mockAvailable.mockRejectedValue(new Error("modulo nativo"));
    await activate();
    expect(
      await screen.findByText("Este telefono no tiene acelerometro. Usa el boton Sortear."),
    ).toBeTruthy();
  });
});
