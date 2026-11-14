# 34-gastos-compartidos-app

App movil del proyecto 34, gastos compartidos entre amigos. Materia Desarrollo Movil, TdeA.
Un grupo de amigos registra sus gastos y la app calcula quien le debe a quien.

Hecha con Expo, React Native, TypeScript y Expo Router. La API esta en el repo `34-gastos-compartidos-api`.

## Como instalar y correr

```bash
npm install
npm start
```

Se abre con Expo Go o con un emulador. La URL de la API va en un archivo `.env`, copiando `env.example`.
Esa URL es publica, no es un secreto.

## Comandos

| Comando                | Que hace                                          |
| ---------------------- | ------------------------------------------------- |
| `npm start`            | Abre Expo                                         |
| `npm run android`      | Abre Expo en Android                              |
| `npm run typecheck`    | Revisa los tipos con TypeScript                   |
| `npm run lint`         | ESLint, no acepta warnings                        |
| `npm run format`       | Arregla el formato con Prettier                   |
| `npm run format:check` | Revisa el formato sin cambiar nada                |
| `npm test`             | Pruebas con cobertura                             |
| `npm run check`        | Corre typecheck, lint, format:check y las pruebas |

Si `npm run check` no pasa, el trabajo no esta terminado.

## Estructura

- `app/` pantallas y rutas
- `src/` logica, base de datos, servicios, sensores y componentes (se va llenando con el plan)
- `tests/` pruebas
- `docs/` enunciado, reglas de negocio, contrato de la API, plan y estado

## Dependencias y por que

Las que venian con la plantilla de Expo y se dejaron:

| Paquete                                                   | Para que                            |
| --------------------------------------------------------- | ----------------------------------- |
| `expo`, `react`, `react-native`                           | Base de la app                      |
| `expo-router`, `expo-linking`, `expo-constants`           | Rutas y navegacion                  |
| `react-native-screens`, `react-native-safe-area-context`  | Las necesita la navegacion          |
| `react-native-gesture-handler`                            | Gestos, lo pide el enunciado        |
| `react-native-reanimated`, `react-native-worklets`        | Animaciones de los gestos           |
| `expo-splash-screen`, `expo-status-bar`, `expo-system-ui` | Pantalla de carga y barra de estado |
| `expo-font`                                               | Fuentes, la usa Expo                |

Las que se agregaron:

| Paquete                         | Para que                                             |
| ------------------------------- | ---------------------------------------------------- |
| `jest`, `jest-expo`             | Correr las pruebas, lo pide el enunciado             |
| `@testing-library/react-native` | Probar pantallas y componentes, lo pide el enunciado |
| `test-renderer`                 | La exige `@testing-library/react-native` version 14  |
| `@types/jest`                   | Tipos de Jest para TypeScript                        |
| `eslint`, `eslint-config-expo`  | Reglas de calidad                                    |
| `prettier`                      | Formato igual en todo el codigo                      |

Se quitaron de la plantilla porque no se usan: `@expo/ui`, `expo-glass-effect`, `expo-image`, `expo-symbols`,
`expo-web-browser`, `expo-device`, `react-dom` y `react-native-web`. La app es solo movil.

## IA

La configuracion de IA y sus evidencias estan en `IA.md` y en la carpeta `ia/`.
