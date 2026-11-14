// Formas de los datos, con los nombres del enunciado y de docs/contrato-api.md.

export type Member = { uid: string; nombre: string };

// Grupo como lo devuelve la API.
export type RemoteGroup = {
  id: string;
  nombre: string;
  codigo: string;
  creador_uid: string;
  miembros: string[];
  miembros_info: Record<string, { nombre: string }>;
  creado_en: string;
};

// Gasto como lo devuelve la API.
export type RemoteExpense = {
  id: string;
  pagador_uid: string;
  descripcion: string;
  monto_centavos: number;
  participantes: string[];
  porcentajes: Record<string, number> | null;
  fecha: string;
  creado_por: string;
  updated_at: string;
  deleted_at: string | null;
};

// Pago entre miembros como lo devuelve la API.
export type RemotePayment = {
  id: string;
  de_uid: string;
  a_uid: string;
  monto_centavos: number;
  fecha: string;
  updated_at: string;
};

// Grupo guardado en el telefono.
export type LocalGroup = { id: string; nombre: string; codigo: string; creador_uid: string };

// Gasto guardado en el telefono. pending = true significa que falta enviarlo a la API.
export type LocalExpense = {
  id: string;
  grupo_id: string;
  pagador_uid: string;
  descripcion: string;
  monto_centavos: number;
  participantes: string[];
  porcentajes: Record<string, number> | null;
  fecha: string;
  creado_por: string;
  synced: boolean;
  deleted: boolean;
  pending: boolean;
};

// Pago guardado en el telefono.
export type LocalPayment = {
  id: string;
  grupo_id: string;
  de_uid: string;
  a_uid: string;
  monto_centavos: number;
  fecha: string;
  pending: boolean;
};

export type SessionUser = { id: string; email: string };
