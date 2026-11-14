// En Jest, Reanimated y worklets cargan su version para web (ver resolver en jest.config.js).
// Esa version no tiene el hilo de interfaz que gesture handler intenta conectar al iniciar,
// por eso se quita getUIRuntimeHolder: gesture handler lo ve ausente y sigue en JavaScript.
jest.mock("react-native-worklets", () => ({
  ...jest.requireActual("react-native-worklets"),
  getUIRuntimeHolder: undefined,
}));
