import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppText } from "@/components/base/AppText";

// QR del grupo para que otro lo escanee desde "Unirse". Lleva solo el codigo, nada mas.
export function GroupQr({ codigo }: { codigo: string }) {
  return (
    <View
      style={styles.box}
      accessible
      accessibilityLabel={`Codigo QR del grupo. Codigo ${codigo}`}
    >
      <QRCode value={codigo} size={160} />
      <AppText>{`Codigo: ${codigo}`}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", gap: 8 },
});
