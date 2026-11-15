# Estado de 34-gastos-compartidos-app

- Fase: app completa y probada en un telefono real (APK y Expo Go) contra la API real. Tema oscuro negro, gris y naranja. 180 pruebas de Jest y 16 del hook. Repo publico: https://github.com/iAdamn/34-gastos-compartidos-app (CI de GitHub Actions).
- API real: https://34-gastos-compartidos-api.vercel.app (en eas.json). Primera APK en EAS (perfil preview, cuenta adnsupreme). Para Expo Go: npx expo start --go con EXPO_PUBLIC_API_URL apuntando a esa URL.
- Siguiente paso: la persona activa el hook (ia/hook/README.md), crea el canario y corre las 10 pruebas de contencion con capturas (C2, C5); README con capturas (A27); revision de hitos por otro chat (A12, A17, A23); video (A25); el companero hace sus commits.
- Fecha limite: sabado 2026-11-21.

## Que se hizo

- 2026-11-14 (Opus): arreglo de rutas sin sesion (+not-found manda al login), sorteo que siempre se nota, rediseno visual (Card, ButtonRow, Notice, tema oscuro), A3 (Husky, lint-staged, CI y plantilla de PR), C3 (hook PreToolUse en ia/hook con 16 pruebas node:test, protege su propia carpeta), docs/trampa.md e ia/PRUEBAS-CONTENCION.md con los 10 prompts. Repos subidos a GitHub como publicos por pedido de la persona. APK v4 (arm64) con todo esto.

- A24 (2026-11-14, Opus): eas.json con perfil preview (APK, EXPO_PUBLIC_API_URL de la API real), android.package co.tdea.gastoscompartidos, versionCode 1, permisos bloqueados (SYSTEM_ALERT_WINDOW y almacenamiento) y scripts/check-secrets.mjs (busca firebaseConfig, claves, localhost y http sin s; se probo con una clave falsa plantada). eas init vinculo el proyecto @adnsupreme/34-gastos-compartidos-app. A25: primer eas build lanzado por la IA con permiso de la persona.

- Paso A1: base de calidad. Scripts typecheck, lint, format:check, test y check. TypeScript con strict y noUncheckedIndexedAccess. ESLint con las reglas en error. Prettier. Jest con jest-expo y React Native Testing Library. El umbral de cobertura del 80 % se activa cuando exista src/domain.
- Las rutas quedaron en app/ como pide el enunciado. Se quitaron las pantallas, componentes, imagenes y paquetes de ejemplo de la plantilla. Queda una pantalla inicial provisional con su prueba.
- Se quito la configuracion web de app.json. El scheme paso a gastoscompartidos porque no puede empezar por numero.
- Paso A2: primer commit del repo con la configuracion de IA y los scripts de calidad.
- Paso A4: dominio puro en src/domain con sus pruebas. money (monto valido y formato $100.000,00), split (reparto igual y por porcentajes, el sobrante va de a 1 peso al uid menor), balance (saldo de cada miembro), settle (pagos sugeridos, el que mas debe le paga al que mas le deben) y groupCode (codigo de 6 caracteres). Los casos salen de docs/casos-dominio.json.
- Base local (A13): src/db con migraciones por PRAGMA user_version. Tablas grupo_cache, miembro_cache, gasto_cache y pago_cache con remote_id, updated_at, deleted y pending.
- Repositorios (A14): todo el SQL con parametros. Busqueda de gastos por descripcion. Probados contra un SQLite real en memoria, el que trae Node.
- Cliente de la API (A18): agrega el token, ante un 401 renueva una vez y reintenta, y si falla borra la sesion. Tokens en expo-secure-store.
- Servicios (A15): gastos y pagos se guardan primero en SQLite como pendientes. El balance se calcula en el telefono con src/domain.
- Sincronizacion (A20): envia lo pendiente una sola vez y trae los cambios desde la ultima sincronizacion. Sin red deja todo pendiente.
- 72 pruebas en total.
- Se omitieron los repositorios en memoria que decia el plan: la entrega es unica y se fue directo a SQLite.

- Pantallas (chat ejecutor, Sonnet): SessionProvider (usuario, signIn, signUp, signOut, loadUser al abrir, onSessionExpired vuelve al login); componentes base en src/components/base (Screen, AppText, AppButton, TextField, StateView); rutas protegidas con Stack.Protected en app/_layout.tsx; app/(auth)/login y registro (comparten src/components/AuthForm); app/(tabs)/index "Mis grupos" (lee SQLite con listLocalGroups, sincroniza con syncEverything, aviso "Sin conexion, mostrando datos guardados"); app/grupo/nuevo (muestra el codigo); app/unirse (404 muestra "Grupo no encontrado", boton de QR desactivado como lugar reservado). Se borraron app/index.tsx y tests/home.test.tsx. Ninguna pantalla hace SQL ni fetch. 110 pruebas, npm run check en verde, expo-doctor 20 de 20.

- Pantallas y sensores (chat ejecutor, Opus, 2026-11-14), un commit por punto:
  1. app/grupo/[id].tsx: gastos con busqueda por descripcion, balance de cada miembro, pagos sugeridos, marca "Pendiente de envio", estados cargando, vacio, error y "Grupo no encontrado". Sincroniza al tomar el foco y cuando NetInfo pasa de sin red a con red (cameBackOnline). En Mis grupos cada grupo ahora abre su pantalla. Rutas grupo/[id] y gasto/nuevo registradas en app/_layout.tsx.
  2. Gesto 1: deslizar un gasto a la izquierda 100 px lo elimina (usePanGesture de gesture handler v3 y useSharedValue de reanimated). Solo si canDelete; si no, el gesto esta desactivado y no hay boton. Alternativa: boton "Eliminar" con accessibilityLabel "Eliminar gasto <descripcion>".
  3. Registrar pago desde un pago sugerido: pide confirmar (los pagos no se anulan), llama addPayment, vibra con expo-haptics (src/sensors/haptics.ts) y siempre muestra "Pago registrado", que es la alternativa si no hay vibracion.
  4. app/gasto/nuevo.tsx: descripcion, monto en pesos, quien pago, participantes y modo. Porcentajes empiezan iguales (sobrante al uid menor) y cambian de a 5 con + y -, entre 1 y 100. Gesto 2: mantener presionado el nombre 400 ms marca o desmarca. Alternativa: casilla con accessibilityLabel "Participa <nombre>".
  5. Sensor 1, camara: src/sensors/useQrScanner.ts revisa CameraView.isAvailableAsync y pide permiso solo al tocar "Escanear codigo QR", con un texto que explica para que. Sin camara o sin permiso lo dice y queda escribir el codigo. El QR leido llena el campo del codigo. El grupo muestra su QR (react-native-qrcode-svg) con solo el codigo. app.json declara el plugin de expo-camera sin microfono.
  6. Sensor 2, acelerometro: src/sensors/shakeDetector.ts (funcion pura, mas de 2 g con 1 s de espera) y src/sensors/useShake.ts (isAvailableAsync, permiso al activar, subscription.remove al desactivar y al salir). Alternativa: boton "Sortear".
- Jest: se agrego react-native-gesture-handler/jestSetup, el resolver de reanimated y tests/helpers/jestSetup.ts (quita getUIRuntimeHolder de worklets en las pruebas) para poder simular los gestos con fireGestureHandler.
- npm run check en verde con 173 pruebas; expo-doctor 20 de 20.

## Notas

- npm audit avisa 28 vulnerabilidades (1 baja y 27 moderadas) que vienen de dependencias de Expo y de las herramientas. No se forzo ningun arreglo.
- expo-doctor pasa los 20 chequeos.
- Ya estan instaladas las dependencias de features (sqlite, secure-store, crypto, netinfo, camera, haptics, sensors, qrcode-svg y svg). Camara, sensores, haptics, QR y netinfo todavia no se usan en el codigo.
- Todos los pasos hasta aqui los hizo el chat planificador desde la carpeta Final, a pedido de la persona, porque no se pudieron abrir chats en este repo por Control remoto. Desde aqui el trabajo de codigo se hace en un chat abierto en la raiz de este repo.

## Bloqueos

Ninguno.

## Decisiones del ejecutor (confirmadas por la persona el 2026-11-14)

- "Pago registrado" se muestra siempre, vibre o no el telefono: sirve a quien no siente la vibracion y cumple "si no hay haptics, mensaje en pantalla".
- El pago se registra por el monto completo del pago sugerido. La spec permite cualquier monto, pero la tarea pedia registrarlo desde un pago sugerido; un pago parcial necesitaria un campo de monto.
- Deslizar elimina sin pedir confirmacion, como dice la tabla de gestos. Si se quiere confirmar, es un cambio pequeno en useGroupActions.
- Al leer un QR se llena el campo del codigo y el usuario toca "Unirme" (asi revisa su nombre visible antes de unirse).
- El QR solo se muestra en la pantalla del grupo, como pidio la tarea. RF-01 dice "crear un grupo con codigo y QR" y el plan A11 nombraba app/grupo/nuevo.tsx: si el docente lo quiere al crear, se agrega GroupQr en esa pantalla (una linea).

## Por verificar en telefono (no se puede en Jest)

- Que deslizar se sienta bien: la distancia de 100 px y que no choque con el desplazamiento vertical de la lista (activeOffsetX de 15 px).
- Que mantener presionado 400 ms marque al participante y que el toque corto sobre el nombre no haga nada.
- Camara: que la vista previa abra, que lea el QR que muestra otro telefono y que el dialogo de permiso salga con el texto de app.json. Que al negar el permiso la app siga.
- Vibracion: que se sienta al confirmar un pago. expo-haptics no tiene isAvailableAsync; si falla se devuelve false y el mensaje en pantalla sigue.
- Acelerometro: que 2 g sea un buen umbral (ni se dispara al caminar ni exige sacudir muy fuerte). En Android requestPermissionsAsync responde concedido sin dialogo.
- Que al volver la red se sincronice solo (NetInfo real) y que lo pendiente se envie.
- Que el QR del grupo se lea bien en pantalla a 160 px.
- Que gesture handler 3 y reanimated 4 funcionen en el build (en Jest se usa la version web de reanimated).

## Por verificar

- Las pantallas solo se probaron con React Native Testing Library y expo-router de mentira. No se han visto en un telefono: falta comprobar que Stack.Protected redirige bien al iniciar y cerrar sesion.
- Al crear o unirse, la pantalla vuelve atras con router.back(); falta ver en el telefono que "Mis grupos" se refresca (usa useFocusEffect).
- Las instrucciones decian leer docs/ en Final, pero esos archivos estan en este repo; se uso la copia de aqui.

- Nada de la capa de datos se ha corrido en un telefono ni contra la API real. Las pruebas usan el SQLite de Node, fetch de mentira y dependencias de mentira.
- src/db/database.ts, src/api/api.ts, src/services/session.ts y src/services/sync.ts solo conectan piezas y no tienen pruebas.
- Las pruebas de repositorios necesitan Node 22.5 o mayor (node:sqlite). Hay que fijar esa version en la CI.

- Que las reglas de `.claude/settings.json` funcionan (lista en `ia/CONFIGURACION.md`).
- Que la app abre en un telefono con `npm start`. Solo se probo con las pruebas automaticas.

## Como probar

`npm run check`. Para verla: `npm start` y abrir con Expo Go.
