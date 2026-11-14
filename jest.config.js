const fs = require("fs");

// Umbral minimo de cobertura para la logica de negocio.
const businessLogicThreshold = { statements: 80, branches: 80, functions: 80, lines: 80 };

// Jest falla si se pide un umbral para una carpeta que no existe.
// Por eso el umbral se activa cuando src/domain ya tiene archivos.
const coverageThreshold = fs.existsSync("./src/domain")
  ? { "./src/domain/": businessLogicThreshold }
  : undefined;

module.exports = {
  preset: "jest-expo",
  // Reemplazan los modulos nativos de gestos para poder simular gestos en las pruebas.
  setupFiles: ["<rootDir>/tests/helpers/jestSetup.ts", "react-native-gesture-handler/jestSetup"],
  // Reanimated y worklets usan un hilo nativo que no existe en Jest; este resolver
  // carga su version para web, que corre en JavaScript.
  resolver: "react-native-reanimated/jest/resolver",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  collectCoverageFrom: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}", "!**/*.test.{ts,tsx}"],
  coverageThreshold,
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
