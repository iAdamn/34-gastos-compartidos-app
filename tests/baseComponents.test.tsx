import { fireEvent, render, screen } from "@testing-library/react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { Screen } from "@/components/base/Screen";
import { StateView } from "@/components/base/StateView";
import { TextField } from "@/components/base/TextField";

describe("AppText", () => {
  it("el titulo es un encabezado accesible", async () => {
    await render(<AppText variant="title">Mis grupos</AppText>);
    expect(screen.getByRole("header", { name: "Mis grupos" })).toBeTruthy();
  });
});

describe("Screen", () => {
  it("muestra su contenido", async () => {
    await render(
      <Screen>
        <AppText>Hola</AppText>
      </Screen>,
    );
    expect(screen.getByText("Hola")).toBeTruthy();
  });
});

describe("AppButton", () => {
  it("es un boton con etiqueta y responde al toque", async () => {
    const onPress = jest.fn();
    await render(<AppButton label="Crear" accessibilityLabel="Crear grupo" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Crear grupo" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("deshabilitado no responde", async () => {
    const onPress = jest.fn();
    await render(<AppButton label="Crear" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole("button", { name: "Crear" }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("TextField", () => {
  it("tiene etiqueta y avisa los cambios", async () => {
    const onChangeText = jest.fn();
    await render(<TextField label="Correo" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText("Correo"), "ana@correo.com");
    expect(onChangeText).toHaveBeenCalledWith("ana@correo.com");
  });

  it("muestra el mensaje de error", async () => {
    await render(
      <TextField label="Correo" value="x" onChangeText={jest.fn()} error="Correo invalido" />,
    );
    expect(screen.getByText("Correo invalido")).toBeTruthy();
  });
});

describe("StateView", () => {
  it("cargando", async () => {
    await render(<StateView state="loading" />);
    expect(screen.getByText("Cargando...")).toBeTruthy();
  });

  it("vacio con mensaje propio", async () => {
    await render(<StateView state="empty" message="Todavia no hay grupos" />);
    expect(screen.getByText("Todavia no hay grupos")).toBeTruthy();
  });

  it("error con boton para reintentar", async () => {
    const onRetry = jest.fn();
    await render(<StateView state="error" message="Fallo" onRetry={onRetry} />);
    await fireEvent.press(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
