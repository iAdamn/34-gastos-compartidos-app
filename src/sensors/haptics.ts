import * as Haptics from "expo-haptics";

// Vibracion corta de exito. expo-haptics no tiene isAvailableAsync: si el telefono no puede
// vibrar la llamada falla, se devuelve false y la pantalla sigue con su mensaje escrito.
export async function vibrateSuccess(): Promise<boolean> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  } catch {
    return false;
  }
}
