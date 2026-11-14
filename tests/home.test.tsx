import { render, screen } from "@testing-library/react-native";

import HomeScreen from "../app/index";

describe("pantalla inicial", () => {
  it("muestra el titulo de la app", async () => {
    await render(<HomeScreen />);

    expect(screen.getByText("Gastos compartidos")).toBeTruthy();
  });
});
