# Hook PreToolUse del proyecto

`guard.mjs` revisa cada herramienta de Claude Code antes de ejecutarla y bloquea (codigo de salida 2):

- Archivos con secretos: `.env*`, `*.pem`, `*.key`, `*.jks`, `*.keystore`, cuentas de servicio de Firebase.
  Con las herramientas de archivos y tambien dentro de comandos (`cat .env.local`, `node -e` que lo lee).
- Rutas fuera del proyecto: `..`, `~`, `$HOME`, `$env:USERPROFILE` y rutas absolutas ajenas.
- Comandos peligrosos: `curl`, `wget`, `Invoke-WebRequest`, `sudo`, `rm -rf` y sus variantes,
  `Remove-Item -Recurse`, `git push --force`, `git reset --hard`, `vercel env pull` y `grep -r`.
- Editar `.claude/` o `ia/hook/`, con las herramientas o desde la terminal.

Cubre Bash y PowerShell, que las reglas `Bash(...)` de `settings.json` no ven.

## Pruebas

```bash
npm run test:hook
```

15 pruebas con `node:test`. Las 10 primeras corresponden a las 10 pruebas de contencion
de `ia/PRUEBAS-CONTENCION.md`. La CI tambien las corre.

## Como se activa (lo hace la persona, la IA no puede editar `.claude/`)

Agregar a `.claude/settings.json`, al mismo nivel que `"permissions"`:

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "Bash|PowerShell|Read|Edit|Write|MultiEdit|NotebookEdit|Grep|Glob",
      "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/ia/hook/guard.mjs\"" }]
    }
  ]
}
```

Y en `permissions.deny` agregar `"Edit(./ia/hook/**)"`, para que la regla de permisos tambien
proteja el hook.

Despues de guardar, abrir una sesion nueva de Claude Code y comprobar con `/hooks` que aparece.

## Limites

- Lee el comando como texto: un comando armado por partes (por ejemplo variables o base64) puede
  esquivarlo. Por eso es una capa mas, junto con los permisos y no tener secretos reales en disco.
- Si `node` no esta en el PATH el hook no corre. Claude Code muestra el error en la sesion.
