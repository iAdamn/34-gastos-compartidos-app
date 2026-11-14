# Spec: gastos compartidos entre amigos (proyecto 34)

Reglas de negocio aprobadas por la persona el 2026-11-14. Esta copia es igual en los dos repos. Si falta una regla no se inventa: se anota como bloqueo en `docs/estado.md`. Si algo choca con `docs/enunciado.md`, manda el enunciado.

## 1. Dinero

- Moneda: pesos colombianos (COP). El COP no usa centavos.
- El usuario escribe pesos enteros. Se guardan como entero en centavos (`monto_centavos` = pesos × 100), como pide el enunciado.
- Un monto válido es entero, mayor que 0 y múltiplo de 100.
- Se muestra con separador de miles y `,00`: `$100.000,00`.
- Nunca se usan decimales para calcular.

## 2. Grupos

- Un grupo tiene nombre (1 a 40 caracteres), código, creador y miembros.
- Código: 6 caracteres, letras mayúsculas y números sin los que se confunden (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`). Lo genera el servidor y es único.
- Máximo 20 miembros. El miembro 21 recibe «El grupo está lleno».
- Al crear o unirse se pide el nombre visible (1 a 30 caracteres). Por defecto, la parte del correo antes de la `@`.
- Se entra con el código escrito o escaneando el QR. El QR contiene solo el código.
- Código que no existe: «Grupo no encontrado».
- Unirse a un grupo donde ya se es miembro no cambia nada y responde bien.
- Crear grupo y unirse necesitan conexión.
- Solo los miembros ven el grupo.

## 3. Gastos

- Un gasto tiene: quién pagó, descripción (1 a 80 caracteres), monto, fecha (`YYYY-MM-DD`), participantes y modo de división.
- El pagador y todos los participantes deben ser miembros del grupo. Mínimo 1 participante, sin repetidos.
- El pagador puede no estar entre los participantes.
- Cualquier miembro puede registrar un gasto. Queda guardado quién lo creó (`creado_por`).
- Solo quien lo creó puede eliminarlo. El borrado es lógico.
- No se editan gastos: se elimina y se crea otro.
- Sin conexión se pueden crear y eliminar gastos. Quedan pendientes y se envían al volver la red.

## 4. Reparto de un gasto

La unidad de reparto es **1 peso** (100 centavos). Es una sola constante del dominio.

Partes iguales:

1. Se ordenan los participantes por `uid` ascendente.
2. Cada uno recibe la parte entera: monto en pesos dividido entre el número de participantes, sin decimales.
3. Los pesos que sobran se reparten de a 1, empezando por el primero de la lista ordenada.

Ejemplo: $100.000 entre 3 da 33.334 / 33.333 / 33.333. El primero en orden de `uid` lleva el peso de más.

Porcentajes:

1. Cada participante tiene un porcentaje entero, mínimo 1. Deben sumar 100.
2. Cada uno recibe monto en pesos × porcentaje ÷ 100, sin decimales.
3. Los pesos que sobran se reparten igual que arriba.

En los dos casos la suma de las partes es exactamente el monto. No se pierde ni se inventa dinero.

## 5. Balance

Para cada miembro:

`saldo = lo que pagó en gastos − lo que le toca de los gastos + pagos que hizo − pagos que recibió`

- Saldo positivo: le deben. Saldo negativo: debe.
- Solo cuentan los gastos no eliminados.
- La suma de los saldos de un grupo siempre es 0.

## 6. Pagos sugeridos

Método voraz, fácil de explicar:

1. Se separan deudores (saldo negativo) y acreedores (saldo positivo).
2. Se toma el que más debe y el que más le deben. Empates: gana el `uid` menor.
3. El deudor le paga al acreedor el menor de los dos valores.
4. Se actualizan los saldos y se repite hasta que todos queden en 0.

Garantiza saldar todo con máximo n − 1 pagos. Si todos están en 0, la lista sale vacía.

## 7. Pagos entre miembros (liquidaciones)

- Cualquier miembro registra un pago: quién paga, a quién y cuánto.
- Los dos deben ser miembros y distintos. Monto válido según la sección 1.
- No hay tope contra la deuda: si alguien paga de más, el balance queda al otro lado.
- No se anulan ni se editan.
- Sin conexión se pueden registrar. Quedan pendientes.

## 8. Sin conexión y sincronización

- La interfaz siempre lee de SQLite.
- Con el grupo ya descargado se ve todo sin red: gastos, balance y pagos sugeridos, recalculados en el teléfono con la misma lógica del servidor.
- Lo creado sin red se marca como pendiente y se envía una sola vez: el `id` lo genera el teléfono y repetir el envío no duplica.
- Si hay conflicto gana la última escritura del servidor.
- Se sincroniza al abrir la app y al volver la red.

## 9. Sesión

- Registro e inicio de sesión con correo y contraseña (mínimo 8 caracteres).
- Los tokens se guardan en `expo-secure-store`.
- Si una petición responde 401 se renueva el token una vez y se reintenta. Si falla, se vuelve al login.

## 10. Gestos y sensores

| Qué                              | Para qué                          | Alternativa         |
| -------------------------------- | --------------------------------- | ------------------- |
| Deslizar un gasto a la izquierda | Eliminarlo (solo quien lo creó)   | Botón «Eliminar»    |
| Mantener presionado un miembro   | Marcarlo como participante        | Casilla o botón     |
| Cámara                           | Escanear el QR para unirse        | Escribir el código  |
| Sacudir el teléfono              | Sortear quién paga la próxima     | Botón «Sortear»     |
| Vibración                        | Confirmar que se registró un pago | Mensaje en pantalla |

Cada sensor revisa `isAvailableAsync()`, pide permiso solo cuando se usa, explica para qué y cancela la suscripción al salir. Sin permiso o sin sensor la app sigue funcionando.

## 11. Fuera de alcance

Editar gastos, rol admin, dividir por ítems, ubicación del gasto, doble toque, varias monedas, fotos, salir de un grupo, expulsar miembros.

## 12. Por confirmar con el docente (no bloquea)

- El ejemplo del enunciado reparte $100.000 entre 3 como 34.000 / 33.000 / 33.000 (unidad de $1.000). Aquí la unidad es 1 peso. Si el docente exige el ejemplo literal, se cambia la constante de la unidad y la tabla de casos.
