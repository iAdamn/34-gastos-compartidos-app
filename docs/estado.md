# Estado de 34-gastos-compartidos-app

- Fase: base de calidad y dominio puro listos. Sin pantallas todavia.
- Siguiente paso: A3 (Husky, lint-staged, CI y plantilla de PR), que quedo pendiente, y A5 (esqueleto de la app).
- Fecha limite: sabado 2026-11-21.

## Que se hizo

- Paso A1: base de calidad. Scripts typecheck, lint, format:check, test y check. TypeScript con strict y noUncheckedIndexedAccess. ESLint con las reglas en error. Prettier. Jest con jest-expo y React Native Testing Library. El umbral de cobertura del 80 % se activa cuando exista src/domain.
- Las rutas quedaron en app/ como pide el enunciado. Se quitaron las pantallas, componentes, imagenes y paquetes de ejemplo de la plantilla. Queda una pantalla inicial provisional con su prueba.
- Se quito la configuracion web de app.json. El scheme paso a gastoscompartidos porque no puede empezar por numero.
- Paso A2: primer commit del repo con la configuracion de IA y los scripts de calidad.
- Paso A4: dominio puro en src/domain con sus pruebas. money (monto valido y formato $100.000,00), split (reparto igual y por porcentajes, el sobrante va de a 1 peso al uid menor), balance (saldo de cada miembro), settle (pagos sugeridos, el que mas debe le paga al que mas le deben) y groupCode (codigo de 6 caracteres). Los casos salen de docs/casos-dominio.json.

## Notas

- npm audit avisa 28 vulnerabilidades (1 baja y 27 moderadas) que vienen de dependencias de Expo y de las herramientas. No se forzo ningun arreglo.
- expo-doctor pasa los 20 chequeos.
- Faltan por instalar las dependencias de features: expo-sqlite, expo-secure-store, expo-camera, expo-haptics, expo-sensors, react-native-qrcode-svg, react-native-svg y netinfo. Se instalan en el paso que las use.
- A1, A2 y A4 los hizo el chat planificador desde la carpeta Final, a pedido de la persona, porque no se pudieron abrir chats en este repo por Control remoto. Desde aqui el trabajo de codigo se hace en un chat abierto en la raiz de este repo.

## Bloqueos

Ninguno.

## Por verificar

- Que las reglas de `.claude/settings.json` funcionan (lista en `ia/CONFIGURACION.md`).
- Que la app abre en un telefono con `npm start`. Solo se probo con las pruebas automaticas.

## Como probar

`npm run check`. Para verla: `npm start` y abrir con Expo Go.
