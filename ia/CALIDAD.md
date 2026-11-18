# Calidad automatica - 34-gastos-compartidos-app

Evidencia de las reglas de calidad automaticas (hoja de configuracion de IA, secciones 6, 7 y 11).
Salida real tomada el 2026-11-18 en Windows con Node 24, sobre el commit indicado.

## Que corre `npm run check`

1. `typecheck`: `tsc --noEmit` con `strict` y `noUncheckedIndexedAccess`.
2. `lint`: `eslint . --max-warnings 0`, con complejidad maxima 10, funciones de maximo 50 lineas,
   profundidad maxima 3, archivos de maximo 300 lineas, sin `console`, `eqeqeq`, sin `any` ni `@ts-ignore`.
3. `format:check`: Prettier.
4. `test`: pruebas con cobertura y umbral del 80 % en `src/domain` (la logica de negocio). Si la cobertura baja, el check falla.
5. `test:hook`: las 16 pruebas del hook PreToolUse con `node:test`.

Husky corre `gitleaks` y `lint-staged` antes de cada commit y `npm run check` antes de cada push.

## Resultado de `npm run check`

Commit: 976a077 (mas el commit que agrega este archivo). Termino con codigo 0.

- Tipos, lint y formato: sin errores ni avisos.
- Pruebas: 23 archivos, **200 pruebas pasan**.
- Hook: **16 de 16** pasan.
- `npx expo-doctor`: 20 de 20.

## Cobertura

```text
File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------|---------|----------|---------|---------|-------------------
All files                    |   85.24 |    82.68 |   79.18 |   85.07 |
 app                         |   96.87 |    83.33 |   85.71 |   96.87 |
...
 src/domain                  |     100 |    84.21 |     100 |     100 |
  balance.ts                 |     100 |      100 |     100 |     100 |
  groupCode.ts               |     100 |      100 |     100 |     100 |
  money.ts                   |     100 |      100 |     100 |     100 |
  settle.ts                  |     100 |       75 |     100 |     100 | 13-26,46-50
  split.ts                   |     100 |    88.88 |     100 |     100 | 31,65
```

La logica de negocio (`src/domain`) tiene 100 % de lineas y funciones. El total general es menor porque
incluye pantallas y piezas que solo conectan con el telefono (base de datos real, almacenamiento seguro).

## CI en GitHub Actions

En verde: https://github.com/iAdamn/34-gastos-compartidos-app/actions/runs/44418773147

Pasos: `npm ci`, `npm run check`, `npx expo-doctor`, busqueda de secretos (`scripts/check-secrets.mjs`),
`npm audit --audit-level=high` y, en otro trabajo, `gitleaks` sobre todo el historial.
