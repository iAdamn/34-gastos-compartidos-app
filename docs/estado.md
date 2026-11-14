# Estado de 34-gastos-compartidos-app

- Fase: capa de datos lista (SQLite, repositorios, cliente de la API, sesion, servicios y sincronizacion). Todavia sin pantallas: la app solo muestra la pantalla inicial provisional.
- Siguiente paso: pantallas (login y registro, mis grupos, crear grupo, unirse, grupo, registrar gasto), proveedor de sesion, gestos y sensores. Sigue pendiente A3 (Husky, CI y plantilla de PR).
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

## Notas

- npm audit avisa 28 vulnerabilidades (1 baja y 27 moderadas) que vienen de dependencias de Expo y de las herramientas. No se forzo ningun arreglo.
- expo-doctor pasa los 20 chequeos.
- Ya estan instaladas las dependencias de features (sqlite, secure-store, crypto, netinfo, camera, haptics, sensors, qrcode-svg y svg). Camara, sensores, haptics, QR y netinfo todavia no se usan en el codigo.
- Todos los pasos hasta aqui los hizo el chat planificador desde la carpeta Final, a pedido de la persona, porque no se pudieron abrir chats en este repo por Control remoto. Desde aqui el trabajo de codigo se hace en un chat abierto en la raiz de este repo.

## Bloqueos

Ninguno.

## Por verificar

- Nada de la capa de datos se ha corrido en un telefono ni contra la API real. Las pruebas usan el SQLite de Node, fetch de mentira y dependencias de mentira.
- src/db/database.ts, src/api/api.ts, src/services/session.ts y src/services/sync.ts solo conectan piezas y no tienen pruebas.
- Las pruebas de repositorios necesitan Node 22.5 o mayor (node:sqlite). Hay que fijar esa version en la CI.

- Que las reglas de `.claude/settings.json` funcionan (lista en `ia/CONFIGURACION.md`).
- Que la app abre en un telefono con `npm start`. Solo se probo con las pruebas automaticas.

## Como probar

`npm run check`. Para verla: `npm start` y abrir con Expo Go.
