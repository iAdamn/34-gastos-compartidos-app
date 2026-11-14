import { tokenStore } from "@/services/session";
import type { LocalExpense, LocalPayment, RemoteGroup, SessionUser } from "@/types";
import type { ChangesResponse } from "@/services/syncService";

import { createApiClient } from "./client";

// Unica credencial que conoce la app: la URL publica de la API.
// EXPO_PUBLIC_ queda dentro del APK, por eso aqui nunca va un secreto.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

// La pantalla raiz registra aqui que hacer cuando la sesion vence (volver al login).
let sessionExpiredHandler: () => void = () => undefined;

export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

const client = createApiClient(API_URL, tokenStore, () => sessionExpiredHandler());

type SessionResponse = { token: string; refreshToken: string; usuario: SessionUser };

// Una funcion por cada ruta de docs/contrato-api.md.

export function register(email: string, password: string): Promise<SessionResponse> {
  return client.request("POST", "/api/auth/registro", { email, password }, false);
}

export function login(email: string, password: string): Promise<SessionResponse> {
  return client.request("POST", "/api/auth/login", { email, password }, false);
}

export async function createGroup(nombre: string, miNombre: string): Promise<RemoteGroup> {
  const body = { nombre, mi_nombre: miNombre };
  const data = await client.request<{ grupo: RemoteGroup }>("POST", "/api/grupos", body);
  return data.grupo;
}

export async function joinGroup(codigo: string, miNombre: string): Promise<RemoteGroup> {
  const body = { codigo, mi_nombre: miNombre };
  const data = await client.request<{ grupo: RemoteGroup }>("POST", "/api/grupos/unirse", body);
  return data.grupo;
}

export async function listGroups(): Promise<RemoteGroup[]> {
  const data = await client.request<{ items: RemoteGroup[] }>("GET", "/api/grupos");
  return data.items;
}

export async function postExpense(gid: string, expense: LocalExpense): Promise<void> {
  await client.request("POST", `/api/grupos/${gid}/gastos`, {
    id: expense.id,
    pagador_uid: expense.pagador_uid,
    descripcion: expense.descripcion,
    monto_centavos: expense.monto_centavos,
    participantes: expense.participantes,
    porcentajes: expense.porcentajes,
    fecha: expense.fecha,
  });
}

export async function deleteExpense(gid: string, id: string): Promise<void> {
  await client.request("DELETE", `/api/grupos/${gid}/gastos/${id}`);
}

export async function postPayment(gid: string, payment: LocalPayment): Promise<void> {
  await client.request("POST", `/api/grupos/${gid}/pagos`, {
    id: payment.id,
    de_uid: payment.de_uid,
    a_uid: payment.a_uid,
    monto_centavos: payment.monto_centavos,
  });
}

export function getChanges(gid: string, since: string | null): Promise<ChangesResponse> {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return client.request("GET", `/api/grupos/${gid}/cambios${query}`);
}
