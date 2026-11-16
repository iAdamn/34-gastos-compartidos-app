# Estado de 34-gastos-compartidos-app

- Fase: app completa y cerrando documentos. Proyecto individual. Fecha limite: sabado 2026-11-21.
- Repo: https://github.com/iAdamn/34-gastos-compartidos-app (publico, CI de GitHub Actions: https://github.com/iAdamn/34-gastos-compartidos-app/actions).
- API: https://34-gastos-compartidos-api.vercel.app (la URL esta en `eas.json`, perfil `preview`). APK de EAS; `versionCode` actual en `app.json`: 6.
- Calidad: `npm run check` en verde con 200 pruebas de Jest y 16 del hook. Husky corre lint-staged y gitleaks (si esta instalado) al commitear y `npm run check` al hacer push.

## Que hay

- Pantallas: login y registro, Mis grupos, crear grupo (con codigo y QR), unirse (codigo escrito o QR), grupo (gastos, balance, pagos sugeridos, buscar), registrar gasto.
- Gestos: deslizar para eliminar un gasto y mantener presionado para elegir participantes, cada uno con su boton alternativo.
- Sensores: camara (escanear QR) y acelerometro (sacudir para sortear quien paga), con alternativa si no hay sensor o permiso. Vibracion al registrar un pago.
- Funciona sin conexion: lee y escribe en SQLite y sincroniza al abrir y al volver la red.
- Accesibilidad: botones y campos con etiqueta y rol, areas de toque de al menos 44 puntos (pruebas en `tests/accessibility.test.tsx`).
- IA: hook `PreToolUse` registrado en `.claude/settings.json` por la persona (`ia/hook/`), `ia/BITACORA.md`, `ia/RETOS.md` (hook y gitleaks).

## Que falta

- De la persona: capturas para el README, video de la APK (A25), canario y las 10 pruebas de contencion con capturas (C2, C5), ensayo de la sustentacion (C9).
- Revisiones por otro chat: A12, A17, A23, A28 y C8. Redactar las evidencias con los resultados reales (C6).
- El trabajo `secretos` (gitleaks) de la CI esta escrito pero no se ha visto correr: necesita un `git push`, que autoriza la persona.

## Decisiones vigentes

- Pagos: se registra el monto completo del pago sugerido y se muestra siempre "Pago registrado", vibre o no el telefono.
- Deslizar elimina sin pedir confirmacion, como dice la tabla de gestos del enunciado.
- Al leer un QR solo se llena el campo del codigo; la persona toca "Unirme" despues de revisar su nombre.
- El QR se muestra al crear el grupo y en la pantalla del grupo (RF-01).

## Notas

- Jest no cubre gestos, camara, vibracion ni acelerometro reales: eso se ve en el telefono.
- `npm audit` avisa 28 vulnerabilidades (1 baja y 27 moderadas) de dependencias de Expo; la CI solo falla con nivel alto. No se forzo ningun arreglo.
- Las pruebas de repositorios usan `node:sqlite`: necesitan Node 22.5 o mayor (la CI usa 24).

## Como probar

```bash
npm install
npm run check
npx expo-doctor
npm start
```

`npm start` abre Expo; para Expo Go usar `npx expo start --go` con `EXPO_PUBLIC_API_URL` apuntando a la API.
