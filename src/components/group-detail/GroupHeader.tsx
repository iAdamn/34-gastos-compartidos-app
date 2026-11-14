import { View } from "react-native";

import { AppText } from "@/components/base/AppText";
import { GroupQr } from "@/components/qr/GroupQr";
import type { LocalGroup } from "@/types";

type Props = {
  group: LocalGroup;
  offline: boolean;
  message: string | null;
  error: string | null;
};

// Nombre del grupo, su QR y los avisos de la pantalla (sin conexion, pago registrado, errores).
export function GroupHeader({ group, offline, message, error }: Props) {
  return (
    <View accessibilityLiveRegion="polite">
      <AppText variant="title">{group.nombre}</AppText>
      <GroupQr codigo={group.codigo} />
      {offline ? <AppText variant="muted">Sin conexion, mostrando datos guardados</AppText> : null}
      {message ? <AppText>{message}</AppText> : null}
      {error ? <AppText variant="error">{error}</AppText> : null}
    </View>
  );
}
