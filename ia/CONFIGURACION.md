# Configuracion de IA - 34-gastos-compartidos-app

Aqui se explica que riesgo cubre cada barrera, que limites tiene y que ajustes se hicieron.
La configuracion esta activa desde el primer commit de este repo.

## Barreras

| Barrera                      | Donde esta                                                                     | Riesgo que cubre                                                                                  | Limite conocido                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Reglas del proyecto          | AGENTS.md y CLAUDE.md                                                          | La IA no sabe el stack ni lo prohibido                                                            | Solo orienta, el modelo la puede ignorar                                                                                 |
| No leer secretos             | deny Read de .env, pem, key, adminsdk, keystore y jks                          | Que la IA lea o copie una clave                                                                   | Una regla Read no ve un grep ni un script de node                                                                        |
| No editar su jaula           | deny Edit(./.claude/**)                                                        | Que la IA se quite las reglas                                                                     | Comprobado con la prueba 9: Edit denegado, Read permitido                                                                |
| Comandos peligrosos          | deny de sudo, rm -rf, curl, wget, push --force, reset --hard y vercel env pull | Borrar, bajar cosas o reescribir historial                                                        | Una regla de Bash no es una frontera, no detiene sh -c ni otra ruta del programa. PowerShell lo cubre el hook (prueba 6) |
| Pedir permiso                | ask de git push, instalar, vercel y eas                                        | Acciones con efecto fuera de la maquina                                                           | Depende de que la persona lea antes de aceptar                                                                           |
| No salir de la carpeta       | blockReadsOutsideWorkingDirectories                                            | Leer otros proyectos o el home                                                                    | Solo cubre las herramientas de lectura, no la terminal. Sin sandbox                                                      |
| Sin modo bypass              | disableBypassPermissionsMode                                                   | Saltarse todos los permisos                                                                       |                                                                                                                          |
| Sin secretos reales en disco | env.example con valores falsos, claves solo en Vercel                          | Que no haya nada que robar                                                                        | Es la barrera mas fuerte                                                                                                 |
| Hook PreToolUse propio       | ia/hook/guard.mjs, registrado en settings.json                                 | Leer secretos o salir de la carpeta desde la terminal, y comandos peligrosos en Bash y PowerShell | Compara texto: comodines, comillas partidas o codigo armado por partes lo pueden esquivar                                |

El docente descarto el sandbox y WSL2, por eso no hay nada de sandbox en settings.json.

## Otras herramientas de IA

Las reglas no son solo para Claude Code. `AGENTS.md` es el formato comun que leen varias herramientas, y cada
una tiene ademas su archivo de configuracion en el repo. La sintaxis se tomo de la documentacion oficial de
cada herramienta (OpenCode 1.19, Gemini CLI y Codex CLI, consultadas el 2026-11-18).

| Herramienta    | Lee las reglas                           | Configuracion en el repo                           | Que hace cumplir                                                                                                                                                                                                                                  | Limite                                                                                                          |
| -------------- | ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Claude Code    | `CLAUDE.md` importa `AGENTS.md`          | `.claude/settings.json` y hook `ia/hook/guard.mjs` | Todo lo de la tabla de barreras                                                                                                                                                                                                                   | Probado con las 10 pruebas de contencion                                                                        |
| OpenCode       | `AGENTS.md` (lo lee solo)                | `opencode.json`                                    | Niega leer y editar `.env*` y claves, editar la configuracion de la IA, salir de la carpeta (`external_directory`) y comandos como `curl`, `wget`, `sudo`, `rm -rf`, `git push --force`; pide permiso para `git push`, instalar, `vercel` y `eas` | Gana la ultima regla que coincide. Los comandos se comparan como texto, igual que el hook                       |
| Codex CLI      | `AGENTS.md` (lo lee solo)                | `.codex/config.toml`                               | Sandbox `workspace-write` (solo escribe dentro del repo), pide permiso para lo demas y sin red en los comandos                                                                                                                                    | Solo carga la configuracion si se marca el proyecto como de confianza                                           |
| Gemini CLI     | `AGENTS.md`, por `.gemini/settings.json` | `.gemini/settings.json`                            | Carga las reglas de `AGENTS.md`                                                                                                                                                                                                                   | Gemini no permite bloquear comandos desde el repo: sus politicas de proyecto no funcionan todavia. Solo orienta |
| Cursor y otras | `AGENTS.md`                              | ninguna                                            | Orientan las reglas escritas                                                                                                                                                                                                                      | No hay barrera tecnica desde el repo                                                                            |

Lo que no se pudo comprobar: OpenCode, Codex y Gemini no estan instalados en esta maquina y no se instalaron
herramientas globales sin permiso. Se valido que los archivos son JSON y TOML correctos, no que cada
herramienta los aplique. La prueba en vivo de la sustentacion se hace con Claude Code.

La configuracion de Claude Code (regla deny y hook) protege `.claude` e `ia/hook`, pero no `opencode.json`,
`.gemini` ni `.codex`. `AGENTS.md` prohibe editarlos y `opencode.json` se protege a si mismo en OpenCode.

## Comprobado

Con las pruebas de contencion reales del 2026-11-16 y 2026-11-18 (detalle en `ia/PRUEBAS-CONTENCION.md`).

- [x] `claude --version` es 2.1.318, mayor que 2.1.257
- [x] Pruebas 1 y 2: no puede leer `.env.local` (regla deny y hook)
- [x] Prueba 5: no puede leer fuera de la carpeta (hook)
- [x] Prueba 9: no puede editar `.claude/settings.json` (regla deny)
- [x] PowerShell: las reglas `Bash(...)` no lo ven, pero el hook si (prueba 6 bloqueada en PowerShell)

Lo que no se comprobo: `blockReadsOutsideWorkingDirectories` por separado, porque el hook bloqueo antes.

## Ajustes hechos

| Fecha      | Que se cambio                                                   | Por que                                                                                       | Commit  |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------- |
| 2026-11-16 | Hook registrado en settings.json y deny de `Edit(./ia/hook/**)` | Sin el hook, la terminal (Bash y PowerShell) podia leer `.env.local`: la linea base lo mostro | 85f9fbe |
| 2026-11-16 | `.claude` fuera de la revision de formato (`.prettierignore`)   | La persona edita settings.json a mano con otra herramienta y Prettier lo marcaba              | 85f9fbe |
