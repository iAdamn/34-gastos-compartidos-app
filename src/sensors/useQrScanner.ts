import { Camera, CameraView } from "expo-camera";
import { useState } from "react";

import { isValidGroupCode, normalizeGroupCode } from "@/domain/groupCode";

// idle: camara cerrada. checking: revisando camara y permiso. scanning: camara abierta.
// unavailable: el telefono no tiene camara. denied: el usuario no dio permiso.
export type ScannerStatus = "idle" | "checking" | "scanning" | "unavailable" | "denied";

// El QR de un grupo lleva solo el codigo. Devuelve el codigo, o null si el QR es otra cosa.
export function parseGroupQr(data: string): string | null {
  const code = normalizeGroupCode(data);
  return isValidGroupCode(code) ? code : null;
}

// Sensor 1: la camara para leer el QR de un grupo.
// Revisa si hay camara y pide el permiso solo cuando el usuario toca "Escanear".
export function useQrScanner(onCode: (codigo: string) => void) {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [invalid, setInvalid] = useState(false);

  async function start() {
    setInvalid(false);
    setStatus("checking");
    try {
      if (!(await CameraView.isAvailableAsync())) {
        setStatus("unavailable");
        return;
      }
      const permission = await Camera.requestCameraPermissionsAsync();
      setStatus(permission.granted ? "scanning" : "denied");
    } catch {
      // Si el modulo de camara falla la app sigue: queda escribir el codigo a mano.
      setStatus("unavailable");
    }
  }

  function handleScan(data: string) {
    const code = parseGroupQr(data);
    if (!code) {
      setInvalid(true);
      return;
    }
    // Al cerrar la camara se deja de leer: no llegan mas lecturas.
    setStatus("idle");
    onCode(code);
  }

  return { status, invalid, start, stop: () => setStatus("idle"), handleScan };
}
