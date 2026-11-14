import type { ReactNode } from "react";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { isDeleteSwipe } from "./swipe";

type Props = { enabled: boolean; onDelete: () => void; testID: string; children: ReactNode };

// Gesto 1: deslizar a la izquierda para eliminar.
// La fila sigue al dedo; al soltar, si se deslizo lo suficiente se elimina y si no vuelve a su lugar.
export function SwipeToDelete({ enabled, onDelete, testID, children }: Props) {
  const offset = useSharedValue(0);
  const pan = usePanGesture({
    enabled,
    testID,
    // Los callbacks corren en JavaScript: son mas faciles de leer y pueden llamar a onDelete.
    runOnJS: true,
    // Solo empieza con un movimiento horizontal, asi el desplazamiento vertical sigue funcionando.
    activeOffsetX: [-15, 15],
    onUpdate: (event) => {
      // Solo se mueve hacia la izquierda.
      offset.value = Math.min(0, event.translationX);
    },
    onDeactivate: (event) => {
      offset.value = withTiming(0);
      if (isDeleteSwipe(event.translationX)) {
        onDelete();
      }
    },
  });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
