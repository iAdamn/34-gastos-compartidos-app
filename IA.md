# IA.md - indice de evidencias de IA (34-gastos-compartidos-app)

- Reglas del proyecto: AGENTS.md y CLAUDE.md
- Configuracion: .claude/settings.json
- Que cubre cada barrera y sus limites: ia/CONFIGURACION.md
- Pruebas de contencion: ia/PRUEBAS-CONTENCION.md (preparadas; las ejecuta la persona con capturas)
- Documento trampa para la prueba de inyeccion: docs/trampa.md
- Bitacora: ia/BITACORA.md
- Calidad automatica:
  - `npm run check`: tipos, lint (funciones de maximo 50 lineas, complejidad maxima 10, sin `any`), formato, pruebas con cobertura y pruebas del hook
  - Husky: `pre-commit` corre gitleaks sobre lo que se va a commitear (si esta instalado) y lint-staged sobre lo modificado y `pre-push` corre `npm run check`
  - CI de GitHub Actions: `.github/workflows/ci.yml` (check, expo-doctor, busqueda de secretos, `npm audit` y gitleaks sobre todo el historial). Enlace: https://github.com/iAdamn/34-gastos-compartidos-app/actions
- Retos de excelencia (detalle y resultados en ia/RETOS.md):
  1. Hook `PreToolUse` propio con 16 pruebas `node:test`: ia/hook/ (README con como activarlo y sus limites)
  2. Busqueda de secretos y direcciones locales en el codigo y el bundle: scripts/check-secrets.mjs, tambien en la CI
  3. `gitleaks` en el pre-commit de Husky y en la CI, probado con una clave falsa plantada: `.gitleaks.toml`, `ia/RETOS.md`
