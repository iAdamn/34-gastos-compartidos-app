// Tema de la app: fondo casi negro, superficies grises y naranja como color de accion.
// Contrastes revisados (WCAG AA): texto sobre fondo y superficies, y texto oscuro sobre el naranja.
export const colors = {
  background: "#1A1918",
  surface: "#262624",
  surfaceRaised: "#30302E",
  border: "#3D3D3A",
  text: "#F5F4EF",
  muted: "#A8A69F",
  primary: "#D97757",
  primaryPressed: "#C2603F",
  primarySoft: "#3A2A23",
  onPrimary: "#1A1918",
  error: "#F28B82",
  errorSoft: "#3B2422",
  success: "#8CC084",
  warning: "#E8B65A",
  warningSoft: "#3A3122",
};

export const spacing = { xsmall: 4, small: 8, medium: 16, large: 24, xlarge: 32 };

export const radius = { small: 8, medium: 12, large: 16, pill: 999 };

export const fontSize = { caption: 13, small: 14, body: 16, heading: 18, title: 26, display: 34 };

// En tabletas el contenido no se estira mas de este ancho y queda centrado.
export const maxContentWidth = 560;
