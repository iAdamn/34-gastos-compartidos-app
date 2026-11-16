import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { TextField } from "@/components/base/TextField";
import { ChoiceButton } from "@/components/expense-form/ChoiceButton";
import { PercentRow } from "@/components/expense-form/PercentRow";

// El area de toque minima recomendada es de 44 puntos por lado.
const MIN_TOUCH = 44;

function size(element: ReturnType<typeof screen.getByRole>) {
  const style = StyleSheet.flatten(element.props.style);
  return { height: Number(style?.minHeight ?? 0), width: Number(style?.minWidth ?? 0) };
}

describe("accesibilidad: tamanos tactiles", () => {
  it("el boton normal mide al menos 44 por 44", async () => {
    await render(<AppButton label="Guardar" onPress={jest.fn()} />);
    const { height, width } = size(screen.getByRole("button", { name: "Guardar" }));
    expect(height).toBeGreaterThanOrEqual(MIN_TOUCH);
    expect(width).toBeGreaterThanOrEqual(MIN_TOUCH);
  });

  it("el boton compacto mide al menos 44 por 44", async () => {
    await render(<AppButton label="+" compact onPress={jest.fn()} />);
    const { height, width } = size(screen.getByRole("button", { name: "+" }));
    expect(height).toBeGreaterThanOrEqual(MIN_TOUCH);
    expect(width).toBeGreaterThanOrEqual(MIN_TOUCH);
  });

  it("la opcion de una lista mide al menos 44 por 44", async () => {
    await render(<ChoiceButton label="Ana" selected={false} onPress={jest.fn()} />);
    const { height, width } = size(screen.getByRole("radio", { name: "Ana" }));
    expect(height).toBeGreaterThanOrEqual(MIN_TOUCH);
    expect(width).toBeGreaterThanOrEqual(MIN_TOUCH);
  });
});

describe("accesibilidad: etiquetas y roles", () => {
  it("los botones de porcentaje dicen de quien son", async () => {
    await render(<PercentRow nombre="Ana" percent={50} step={5} onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Bajar porcentaje de Ana" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Subir porcentaje de Ana" })).toBeTruthy();
  });

  it("un boton deshabilitado lo anuncia en su estado", async () => {
    await render(<AppButton label="Guardar" onPress={jest.fn()} disabled />);
    expect(screen.getByRole("button", { name: "Guardar", disabled: true })).toBeTruthy();
  });

  it("la opcion elegida se anuncia como seleccionada", async () => {
    await render(<ChoiceButton label="Ana" selected onPress={jest.fn()} />);
    expect(screen.getByRole("radio", { name: "Ana", selected: true })).toBeTruthy();
  });

  it("el campo de texto tiene etiqueta accesible", async () => {
    await render(<TextField label="Monto en pesos" value="" onChangeText={jest.fn()} />);
    expect(screen.getByLabelText("Monto en pesos")).toBeTruthy();
  });
});
