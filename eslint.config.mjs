import expoConfig from "eslint-config-expo/flat.js";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...expoConfig,
  {
    // Reglas de calidad del proyecto. Todas en error: si fallan, no pasa el check.
    rules: {
      complexity: ["error", 10],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 3],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "no-console": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
  {
    // En las pruebas un describe agrupa muchos casos y pasa facil de 50 lineas.
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: { "max-lines-per-function": "off" },
  },
  globalIgnores(["node_modules/**", ".expo/**", "dist/**", "coverage/**", "expo-env.d.ts"]),
]);

export default eslintConfig;
