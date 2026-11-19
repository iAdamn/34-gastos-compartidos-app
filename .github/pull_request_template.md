## Que cambia

<!-- Una o dos frases. -->

## Como se probo

- [ ] `npm run check` en verde
- [ ] Probado en un telefono (si toca pantallas, gestos o sensores)

## Uso de IA

- Que genero la IA en este cambio:
- [ ] Lo entendi y puedo explicarlo linea por linea
- [ ] Hay pruebas que cubren el cambio
- [ ] No hay secretos (claves, tokens, `.env`) en el cambio

## Revision

- [ ] Sin secretos ni `localhost` (`node scripts/check-secrets.mjs`)
- [ ] Cada gesto tiene un boton alternativo con `accessibilityLabel`
- [ ] Cada sensor revisa `isAvailableAsync`, pide permiso al usarse y tiene alternativa
- [ ] Si se uso IA, quedo anotado en `ia/BITACORA.md`
