# Retos de excelencia de IA (34-gastos-compartidos-app)

## Reto 1: hook PreToolUse propio

Esta en `ia/hook/` (README con como se activa y sus limites) y tiene 16 pruebas con `node:test`: `npm run test:hook`.

## Reto 2: gitleaks contra claves en el codigo

Objetivo: que una clave no pueda llegar al repositorio, ni por un commit ni por un push.

### Que se hizo

- `.gitleaks.toml`: usa las reglas por defecto de gitleaks (`useDefault = true`). Tiene una excepcion: el nombre del repo de la API (`34-gastos-compartidos-api`) en `AGENTS.md` parecia una clave (regla `generic-api-key`), es un falso positivo.
- `.husky/pre-commit`: antes de `lint-staged` corre `gitleaks git --staged --redact`. Si `gitleaks` no esta instalado en el equipo solo avisa y sigue, porque instalar programas globales no esta permitido sin preguntar. En ese caso lo cubre la CI.
- `.github/workflows/ci.yml`: trabajo `secretos` con `gitleaks/gitleaks-action@v2`. El checkout usa `fetch-depth: 0` para revisar todo el historial y no solo el ultimo commit.
- Ademas queda lo que ya existia: `scripts/check-secrets.mjs` (app) y las reglas de `.claude/settings.json`.

### Como se probo

Version usada: gitleaks 8.30.1. Se descargo el binario oficial de los releases de GitHub con permiso de la persona, se comprobo su SHA-256 contra `gitleaks_8.30.1_checksums.txt` y se uso desde una carpeta temporal fuera del repo. No se instalo nada global.

1. Escaneo del historial: `gitleaks git . --redact`.
   - Primer escaneo, sin excepcion: 46 commits, 1 hallazgo, un falso positivo en `AGENTS.md` (el nombre del repo de la API). Se agrego la excepcion y el segundo escaneo dio 0 hallazgos.
2. Clave falsa: un archivo `prueba-clave-falsa.txt` con `token = "ghp_..."` y 36 letras y numeros al azar generados en el momento (no es una clave real).
3. Se agrego al area de preparacion con `git add` y se corrio el hook con gitleaks en el PATH: `sh -e .husky/pre-commit`.
4. Despues se quito: `git reset -- prueba-clave-falsa.txt` y se borro el archivo.

### Resultado real

- Con gitleaks disponible, el hook detecto la clave (`leaks found: 1`) y termino con codigo de salida 1: el commit se habria bloqueado.
- Sin gitleaks en el PATH, el hook avisa "gitleaks no esta instalado" y deja pasar. Es el limite conocido: en un equipo sin gitleaks la defensa es la CI.
- **Error durante la prueba:** la primera vez se hizo un control sin gitleaks con un commit real y la clave falsa quedo commiteada en local (no se subio). Se quito con `git reset --soft HEAD~1` y se volvio a crear el commit de otra sesion que habia quedado encima, con su mismo mensaje y autor. Se comprobo que el historial ya no contiene la clave falsa. Lo correcto era probar el hook sin hacer commit, como se hizo despues.
- El trabajo `secretos` de la CI ya corrio despues del push del 2026-11-18 y quedo en verde en GitHub Actions.
