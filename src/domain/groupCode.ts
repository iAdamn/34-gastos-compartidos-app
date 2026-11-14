// Codigo de grupo: 6 caracteres. No se usan O, 0, I ni 1 porque se confunden al leerlos.
export const GROUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const GROUP_CODE_LENGTH = 6;

// Deja el codigo como se guarda: sin espacios y en mayusculas.
export function normalizeGroupCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidGroupCode(code: string): boolean {
  if (code.length !== GROUP_CODE_LENGTH) {
    return false;
  }
  return [...code].every((character) => GROUP_CODE_ALPHABET.includes(character));
}

// Genera un codigo. Recibe la funcion de azar (por ejemplo Math.random)
// para poder probarla con valores fijos.
export function generateGroupCode(random: () => number): string {
  let code = "";
  for (let position = 0; position < GROUP_CODE_LENGTH; position += 1) {
    const index = Math.floor(random() * GROUP_CODE_ALPHABET.length);
    code += GROUP_CODE_ALPHABET.charAt(index);
  }
  return code;
}
