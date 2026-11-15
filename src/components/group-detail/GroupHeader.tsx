import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { Card } from "@/components/base/Card";
import { Notice } from "@/components/base/Notice";
import { spacing } from "@/components/base/theme";
import { GroupQr } from "@/components/qr/GroupQr";
import type { LocalGroup } from "@/types";

type Props = {
  group: LocalGroup;
  offline: boolean;
  message: string | null;
  error: string | null;
};

// Nombre del grupo, su QR para invitar y los avisos de la pantalla (sin conexion, pago, errores).
export function GroupHeader({ group, offline, message, error }: Props) {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <Card>
        <AppText variant="title">{group.nombre}</AppText>
        <AppText variant="muted">Muestra este QR para que tus amigos se unan</AppText>
        <GroupQr codigo={group.codigo} />
      </Card>
      {offline ? <Notice tone="warning">Sin conexion, mostrando datos guardados</Notice> : null}
      {message ? <Notice>{message}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.medium - 4 },
});
