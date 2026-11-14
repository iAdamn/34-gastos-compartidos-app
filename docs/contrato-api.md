# Contrato HTTP entre la app y la API (proyecto 34)

Esta copia es igual en los dos repos. Solo cambia en `Final/docs/arranque/comun/`. Si un paso necesita un cambio, se anota como bloqueo. Sale del enunciado (sección 9) y de `docs/spec.md`.

## Convenciones

- Base: `EXPO_PUBLIC_API_URL`. Todo en JSON. Siempre HTTPS.
- Rutas privadas: cabecera `Authorization: Bearer <ID token>`. El `uid` sale del token verificado.
- Campos en `snake_case`. Dinero en centavos enteros (múltiplo de 100). Fechas ISO 8601 UTC, o `YYYY-MM-DD` para `fecha` del gasto. Sin `undefined`: se usa `null`.
- Se valida con Zod. Los campos no declarados se descartan.
- Los `id` de gastos y pagos los genera el cliente (UUID).

## Errores

Siempre `{ "error": "mensaje", "detalles"?: [{ "campo", "mensaje" }] }`.

| Código | Cuándo                                                        |
| ------ | ------------------------------------------------------------- |
| 400    | Cuerpo inválido. Lleva `detalles`                             |
| 401    | Sin token, token inválido o vencido, o credenciales inválidas |
| 403    | No es miembro del grupo, o no es quien creó el gasto          |
| 404    | No existe                                                     |
| 409    | Correo repetido, o grupo lleno                                |
| 429    | Demasiados intentos                                           |
| 500    | `{ "error": "Error interno" }`, sin detalles                  |

## Salud

`GET /api/health` → `200 { "ok": true }`. Pública.

## Autenticación

| Ruta                      | Cuerpo                               | Respuesta                                                          |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| `POST /api/auth/registro` | `{ email, password }` (password ≥ 8) | `201 { token, refreshToken, expiraEnSeg, usuario: { id, email } }` |
| `POST /api/auth/login`    | `{ email, password }`                | `200`, igual que el registro                                       |
| `POST /api/auth/refresh`  | `{ refreshToken }`                   | `200 { token, refreshToken, expiraEnSeg }`                         |
| `GET /api/auth/yo`        | — (Bearer)                           | `200 { usuario: { id, email } }`                                   |

Errores: correo repetido 409; contraseña débil o correo mal escrito 400; credenciales inválidas 401 con el mensaje «Correo o contraseña incorrectos», exista o no el correo; demasiados intentos 429; refresh inválido 401.

## Objetos

```text
grupo  { id, nombre, codigo, creador_uid, miembros: string[], miembros_info: { <uid>: { nombre } }, creado_en }
gasto  { id, pagador_uid, descripcion, monto_centavos, participantes: string[],
         porcentajes: { <uid>: entero } | null, fecha, creado_por, lat: null, lng: null,
         creado_en, updated_at, deleted_at: ISO | null }
pago   { id, de_uid, a_uid, monto_centavos, fecha, creado_por, updated_at }
```

`lat` y `lng` existen por el modelo del enunciado y siempre van en `null` (la ubicación está fuera de alcance). `updated_at` lo pone el servidor y sirve para `cambios`.

## Grupos

| Ruta                      | Cuerpo                  | Respuesta                                    | Errores                                                   |
| ------------------------- | ----------------------- | -------------------------------------------- | --------------------------------------------------------- |
| `POST /api/grupos`        | `{ nombre, mi_nombre }` | `201 { grupo }`                              | 400                                                       |
| `POST /api/grupos/unirse` | `{ codigo, mi_nombre }` | `200 { grupo }`                              | 400; 404 «Grupo no encontrado»; 409 «El grupo está lleno» |
| `GET /api/grupos`         | —                       | `200 { items: grupo[] }` (donde soy miembro) |                                                           |

- El código se guarda en mayúsculas. `unirse` lo acepta en minúsculas y lo convierte.
- Unirse siendo ya miembro responde `200` con el grupo, sin cambios.

## Rutas de un grupo

Todas responden 403 si el `uid` no está en `miembros` y 404 si el grupo no existe.

| Ruta                                       | Cuerpo                                                                                | Respuesta                                           | Errores                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `POST /api/grupos/:gid/gastos`             | `{ id, pagador_uid, descripcion, monto_centavos, participantes, porcentajes, fecha }` | `201 { gasto }`                                     | 400                            |
| `DELETE /api/grupos/:gid/gastos/:id`       | —                                                                                     | `200 { ok: true }`                                  | 403 si no lo creó; 404         |
| `POST /api/grupos/:gid/pagos`              | `{ id, de_uid, a_uid, monto_centavos }`                                               | `201 { pago }`                                      | 400                            |
| `GET /api/grupos/:gid/balance`             | —                                                                                     | `200 { balances, pagos_sugeridos, servidor_ahora }` |                                |
| `GET /api/grupos/:gid/cambios?since=<ISO>` | —                                                                                     | `200 { grupo, gastos, pagos, servidor_ahora }`      | 400 si `since` no es una fecha |

Detalles:

- **Crear gasto.** `creado_por` es el `uid` del token. Validaciones: monto válido; `participantes` con 1 a 20 uids sin repetir, todos miembros; `pagador_uid` miembro; `porcentajes` es `null` (partes iguales) o un objeto con exactamente los mismos uids de `participantes`, enteros ≥ 1 que suman 100. Repetir el mismo `id` no duplica: responde `200` con el gasto ya guardado.
- **Eliminar gasto.** Borrado lógico: pone `deleted_at` y `updated_at`. Repetirlo responde `200`.
- **Crear pago.** `de_uid` y `a_uid` miembros y distintos. `fecha` la pone el servidor. Repetir el mismo `id` responde `200` con el pago ya guardado.
- **Balance.** `balances: [{ uid, nombre, saldo_centavos }]` ordenado por `uid`; `pagos_sugeridos: [{ de_uid, a_uid, monto_centavos }]`. Lo calcula el servidor con `src/domain`.
- **Cambios.** Sin `since` devuelve todo. Con `since` devuelve gastos y pagos con `updated_at` mayor, incluidos los eliminados, ordenados por `updated_at`. Máximo 500 por lista: si llegan 500, la app repite con el último `updated_at`. `grupo` siempre va completo (así llegan los miembros nuevos).

## Firestore (solo lo toca la API)

```text
grupos/{gid}                 nombre, codigo, creador_uid, miembros[], miembros_info{}, creado_en
grupos/{gid}/gastos/{id}     campos del objeto gasto
grupos/{gid}/pagos/{id}      campos del objeto pago
codigos_grupo/{codigo}       { gid }   creado con create(): si ya existe se genera otro código
```

Reglas: `allow read, write: if false;`. «Mis grupos»: `where('miembros', 'array-contains', uid)`.
