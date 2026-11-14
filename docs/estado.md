# Estado de 34-gastos-compartidos-app

- Fase: capa de datos y primeras pantallas listas: sesion, login y registro, mis grupos, crear grupo y unirse. Faltan la pantalla de un grupo y registrar gasto. Todavia no se ha corrido en un telefono.
- Siguiente paso: pantalla de un grupo (gastos, balance, pagos sugeridos), registrar gasto, gestos y sensores (QR en unirse). Sigue pendiente A3 (Husky, CI y plantilla de PR).
- Fecha limite: sabado 2026-11-21.

## Que se hizo

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

## Notas

- npm audit avisa 28 vulnerabilidades (1 baja y 27 moderadas) que vienen de dependencias de Expo y de las herramientas. No se forzo ningun arreglo.
- expo-doctor pasa los 20 chequeos.
- Ya estan instaladas las dependencias de features (sqlite, secure-store, crypto, netinfo, camera, haptics, sensors, qrcode-svg y svg). Camara, sensores, haptics, QR y netinfo todavia no se usan en el codigo.
- Todos los pasos hasta aqui los hizo el chat planificador desde la carpeta Final, a pedido de la persona, porque no se pudieron abrir chats en este repo por Control remoto. Desde aqui el trabajo de codigo se hace en un chat abierto en la raiz de este repo.

## Bloqueos

Ninguno.

## Por verificar

- Las pantallas solo se probaron con React Native Testing Library y expo-router de mentira. No se han visto en un telefono: falta comprobar que Stack.Protected redirige bien al iniciar y cerrar sesion.
- Al crear o unirse, la pantalla vuelve atras con router.back(); falta ver en el telefono que "Mis grupos" se refresca (usa useFocusEffect).
- El boton "Escanear codigo QR" esta desactivado a proposito hasta el paso de la camara.
- Las instrucciones decian leer docs/ en Final, pero esos archivos estan en este repo; se uso la copia de aqui.

- Nada de la capa de datos se ha corrido en un telefono ni contra la API real. Las pruebas usan el SQLite de Node, fetch de mentira y dependencias de mentira.
- src/db/database.ts, src/api/api.ts, src/services/session.ts y src/services/sync.ts solo conectan piezas y no tienen pruebas.
- Las pruebas de repositorios necesitan Node 22.5 o mayor (node:sqlite). Hay que fijar esa version en la CI.

- Que las reglas de `.claude/settings.json` funcionan (lista en `ia/CONFIGURACION.md`).
- Que la app abre en un telefono con `npm start`. Solo se probo con las pruebas automaticas.

## Como probar

`npm run check`. Para verla: `npm start` y abrir con Expo Go.
