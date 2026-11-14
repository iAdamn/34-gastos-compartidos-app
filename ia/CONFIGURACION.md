# Configuracion de IA - 34-gastos-compartidos-app

Aqui se explica que riesgo cubre cada barrera, que limites tiene y que ajustes se hicieron.
La configuracion esta activa desde el primer commit de este repo.

## Barreras

| Barrera                      | Donde esta                                                                     | Riesgo que cubre                           | Limite conocido                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Reglas del proyecto          | AGENTS.md y CLAUDE.md                                                          | La IA no sabe el stack ni lo prohibido     | Solo orienta, el modelo la puede ignorar                                                                   |
| No leer secretos             | deny Read de .env, pem, key, adminsdk, keystore y jks                          | Que la IA lea o copie una clave            | Una regla Read no ve un grep ni un script de node                                                          |
| No editar su jaula           | deny Edit(./.claude/**)                                                        | Que la IA se quite las reglas              | Por verificar con la prueba 9                                                                              |
| Comandos peligrosos          | deny de sudo, rm -rf, curl, wget, push --force, reset --hard y vercel env pull | Borrar, bajar cosas o reescribir historial | Una regla de Bash no es una frontera, no detiene sh -c ni otra ruta del programa. Falta revisar PowerShell |
| Pedir permiso                | ask de git push, instalar, vercel y eas                                        | Acciones con efecto fuera de la maquina    | Depende de que la persona lea antes de aceptar                                                             |
| No salir de la carpeta       | blockReadsOutsideWorkingDirectories                                            | Leer otros proyectos o el home             | Solo cubre las herramientas de lectura, no la terminal. Sin sandbox                                        |
| Sin modo bypass              | disableBypassPermissionsMode                                                   | Saltarse todos los permisos                |                                                                                                            |
| Sin secretos reales en disco | env.example con valores falsos, claves solo en Vercel                          | Que no haya nada que robar                 | Es la barrera mas fuerte                                                                                   |

El docente descarto el sandbox y WSL2, por eso no hay nada de sandbox en settings.json.

## Por verificar despues del primer commit

- [ ] claude --version es 2.1.257 o mayor
- [ ] Prueba 1 y 2: no puede leer .env.local
- [ ] Prueba 5: no puede leer fuera de la carpeta
- [ ] Prueba 9: no puede editar .claude/settings.json
- [ ] Como se escriben las reglas para la herramienta PowerShell

## Ajustes hechos

| Fecha | Que se cambio | Por que | Commit |
| ----- | ------------- | ------- | ------ |
