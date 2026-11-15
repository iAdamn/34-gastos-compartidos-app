import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { colors, fontSize, radius, spacing } from "@/components/base/theme";

// QR del grupo para que otro lo escanee desde "Unirse". Lleva solo el codigo, nada mas.
// Va sobre fondo blanco aunque la app sea oscura: asi la camara lo lee mejor.
export function GroupQr({ codigo }: { codigo: string }) {
  return (
    <View
      style={styles.box}
      accessible
      accessibilityLabel={`Codigo QR del grupo. Codigo ${codigo}`}
    >
      <View style={styles.qr}>
        <QRCode value={codigo} size={160} />
      </View>
      <Text style={styles.code}>{`Codigo: ${codigo}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", gap: spacing.medium - 4 },
  qr: { padding: spacing.medium - 4, backgroundColor: "#FFFFFF", borderRadius: radius.medium },
  code: { fontSize: fontSize.heading, fontWeight: "700", color: colors.primary, letterSpacing: 1 },
});
