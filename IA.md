# IA.md - indice de evidencias de IA (34-gastos-compartidos-app)

- Reglas del proyecto: AGENTS.md y CLAUDE.md
- Configuracion: .claude/settings.json
- Que cubre cada barrera y sus limites: ia/CONFIGURACION.md
- Pruebas de contencion: ia/PRUEBAS-CONTENCION.md (preparadas; las ejecuta la persona con capturas)
- Documento trampa para la prueba de inyeccion: docs/trampa.md
- Bitacora: ia/BITACORA.md
- Calidad automatica:
  - `npm run check`: tipos, lint (funciones de maximo 50 lineas, complejidad maxima 10, sin `any`), formato, pruebas con cobertura y pruebas del hook
  - Husky: `pre-commit` corre lint-staged sobre lo modificado y `pre-push` corre `npm run check`
  - CI de GitHub Actions: `.github/workflows/ci.yml` (check, expo-doctor, busqueda de secretos, `npm audit`). Enlace: pendiente de subir el repo
- Retos de excelencia:
  1. Hook `PreToolUse` propio con 15 pruebas `node:test`: ia/hook/ (README con como activarlo y sus limites)
  2. Busqueda de secretos y direcciones locales en el codigo y el bundle: scripts/check-secrets.mjs, tambien en la CI
