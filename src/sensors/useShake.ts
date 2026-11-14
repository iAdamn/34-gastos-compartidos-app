import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

import { isShake } from "./shakeDetector";

// off: apagado. checking: revisando sensor y permiso. on: escuchando el acelerometro.
// unavailable: no hay acelerometro. denied: el usuario no dio permiso.
export type ShakeStatus = "off" | "checking" | "on" | "unavailable" | "denied";

// Lecturas por segundo: una cada 100 ms basta para notar una sacudida.
const UPDATE_INTERVAL_MS = 100;

// Sensor 2: el acelerometro para detectar cuando el usuario sacude el telefono.
// Solo se activa cuando el usuario lo pide. onShake debe ser estable (useCallback).
export function useShake(onShake: () => void) {
  const [status, setStatus] = useState<ShakeStatus>("off");
  const lastShakeAt = useRef<number | null>(null);

  async function enable() {
    setStatus("checking");
    try {
      if (!(await Accelerometer.isAvailableAsync())) {
        setStatus("unavailable");
        return;
      }
      const permission = await Accelerometer.requestPermissionsAsync();
      setStatus(permission.granted ? "on" : "denied");
    } catch {
      // Si el sensor falla la app sigue: queda el boton Sortear.
      setStatus("unavailable");
    }
  }

  useEffect(() => {
    if (status !== "on") {
      return;
    }
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    const subscription = Accelerometer.addListener((sample) => {
      const now = Date.now();
      if (isShake(sample, now, lastShakeAt.current)) {
        lastShakeAt.current = now;
        onShake();
      }
    });
    // Al desactivar o al salir de la pantalla se cancela la suscripcion.
    return () => subscription.remove();
  }, [status, onShake]);

  return { status, enable, disable: () => setStatus("off") };
}
