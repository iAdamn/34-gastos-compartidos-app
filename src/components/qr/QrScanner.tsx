import { CameraView } from "expo-camera";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { radius, spacing } from "@/components/base/theme";
import { useQrScanner, type ScannerStatus } from "@/sensors/useQrScanner";

const STATUS_TEXT: Partial<Record<ScannerStatus, string>> = {
  checking: "Abriendo la camara...",
  unavailable: "Este telefono no tiene camara. Escribe el codigo.",
  denied: "Sin permiso de camara. Puedes escribir el codigo.",
};

// Boton para escanear el QR de un grupo. Al leer un codigo valido llama a onCode.
// Si no hay camara o permiso, se muestra el motivo y el usuario escribe el codigo.
export function QrScanner({ onCode }: { onCode: (codigo: string) => void }) {
  const scanner = useQrScanner(onCode);
  const message = STATUS_TEXT[scanner.status];

  if (scanner.status === "scanning") {
    return (
      <View style={styles.box}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(result) => scanner.handleScan(result.data)}
        />
        {scanner.invalid ? <AppText variant="error">Ese QR no es de un grupo</AppText> : null}
        <AppButton label="Cerrar camara" variant="secondary" onPress={scanner.stop} />
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <AppText variant="muted">La camara solo se usa para leer el QR del grupo</AppText>
      <AppButton
        label="Escanear codigo QR"
        disabled={scanner.status === "checking"}
        onPress={scanner.start}
      />
      {message ? <AppText variant="muted">{message}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.medium - 4 },
  camera: { height: 280, borderRadius: radius.medium, overflow: "hidden" },
});
