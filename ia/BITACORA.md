# Bitacora de uso de IA

Cada uso importante de IA: para que se uso, que respondio, como se valido y que se decidio.
Tambien los casos en que se rechazo o se corrigio lo que propuso la IA. Minimo 3 casos reales.
Nunca se pegan claves ni el contenido de un .env.

| Fecha      | Herramienta y prompt resumido                                                    | Que respondio                                                                                      | Como se valido                                    | Decision                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-14 | Claude Code (Fable): "monta la base de calidad de la app y haz el primer commit" | Scripts de calidad, ESLint, Prettier, Jest, rutas en app/, pantalla inicial con su prueba y README | npm run check en verde y expo-doctor con 20 de 20 | Aceptado. Se corrigio a la IA: expo install dejo jest y eslint-config-expo en dependencies y se pasaron a devDependencies, faltaba test-renderer, faltaban los tipos de jest en tsconfig y el scheme de app.json era invalido |
