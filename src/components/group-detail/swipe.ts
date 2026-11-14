// Distancia en pixeles que hay que deslizar a la izquierda para eliminar un gasto.
export const DELETE_SWIPE_DISTANCE = 100;

// translationX es negativo cuando el dedo se mueve a la izquierda.
export function isDeleteSwipe(translationX: number): boolean {
  return translationX <= -DELETE_SWIPE_DISTANCE;
}
