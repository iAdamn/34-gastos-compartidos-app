import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { TextField } from "@/components/base/TextField";

describe("error de un campo de texto", () => {
  it("se anuncia al lector de pantalla como alerta", async () => {
    await render(<TextField label="Correo" value="" error="Escribe un correo valido" />);

    const alert = screen.getByRole("alert");
    expect(alert.props.accessibilityLiveRegion).toBe("polite");
    expect(screen.getByText("Escribe un correo valido")).toBeTruthy();
  });

  it("sin error no hay alerta", async () => {
    await render(<TextField label="Correo" value="" />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
