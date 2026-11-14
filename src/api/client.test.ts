import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { ApiClientError, createApiClient, type TokenStore, type Tokens } from "./client";

// Guarda los tokens en memoria, en vez del almacenamiento seguro del telefono.
function memoryStore(initial: Tokens | null): TokenStore & { current: Tokens | null } {
  const store = {
    current: initial,
    get: async () => store.current,
    set: async (tokens: Tokens) => {
      store.current = tokens;
    },
    clear: async () => {
      store.current = null;
    },
  };
  return store;
}

type Call = { url: string; authorization: string | null; body: string | null };

// Reemplaza fetch por una cola de respuestas y anota cada llamada.
function mockFetch(responses: (Response | Error)[]): Call[] {
  const calls: Call[] = [];
  globalThis.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    calls.push({
      url: String(input),
      authorization: headers.get("authorization"),
      body: typeof init?.body === "string" ? init.body : null,
    });
    const next = responses.shift();
    if (next === undefined || next instanceof Error) {
      throw next ?? new Error("sin respuesta preparada");
    }
    return next;
  });
  return calls;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const originalFetch = globalThis.fetch;
const tokens: Tokens = { token: "viejo", refreshToken: "refresh" };

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("cliente de la API", () => {
  it("manda el token y devuelve el JSON", async () => {
    const calls = mockFetch([jsonResponse(200, { items: [] })]);
    const client = createApiClient("https://api.test", memoryStore(tokens), () => undefined);

    const data = await client.request("GET", "/api/grupos");

    expect(data).toEqual({ items: [] });
    expect(calls[0]?.url).toBe("https://api.test/api/grupos");
    expect(calls[0]?.authorization).toBe("Bearer viejo");
  });

  it("ante un 401 renueva el token una vez y reintenta", async () => {
    const store = memoryStore(tokens);
    const calls = mockFetch([
      jsonResponse(401, { error: "Token invalido o vencido" }),
      jsonResponse(200, { token: "nuevo", refreshToken: "refresh2", expiraEnSeg: 3600 }),
      jsonResponse(200, { ok: true }),
    ]);
    const client = createApiClient("https://api.test", store, () => undefined);

    const data = await client.request("GET", "/api/grupos");

    expect(data).toEqual({ ok: true });
    expect(calls).toHaveLength(3);
    expect(calls[1]?.url).toBe("https://api.test/api/auth/refresh");
    expect(calls[2]?.authorization).toBe("Bearer nuevo");
    expect(store.current).toEqual({ token: "nuevo", refreshToken: "refresh2" });
  });

  it("si la renovacion falla borra la sesion y avisa", async () => {
    const store = memoryStore(tokens);
    const onExpired = jest.fn();
    mockFetch([
      jsonResponse(401, { error: "Token invalido o vencido" }),
      jsonResponse(401, { error: "La sesion ya no es valida" }),
    ]);
    const client = createApiClient("https://api.test", store, onExpired);

    await expect(client.request("GET", "/api/grupos")).rejects.toMatchObject({ status: 401 });
    expect(store.current).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("no reintenta mas de una vez", async () => {
    const calls = mockFetch([
      jsonResponse(401, { error: "x" }),
      jsonResponse(200, { token: "nuevo", refreshToken: "refresh2", expiraEnSeg: 3600 }),
      jsonResponse(401, { error: "x" }),
    ]);
    const client = createApiClient("https://api.test", memoryStore(tokens), () => undefined);

    await expect(client.request("GET", "/api/grupos")).rejects.toMatchObject({ status: 401 });
    expect(calls).toHaveLength(3);
  });

  it("convierte la respuesta de error de la API en ApiClientError", async () => {
    mockFetch([jsonResponse(404, { error: "Grupo no encontrado" })]);
    const client = createApiClient("https://api.test", memoryStore(tokens), () => undefined);

    const error = await client.request("POST", "/api/grupos/unirse", {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ status: 404, message: "Grupo no encontrado" });
  });

  it("sin red lanza un error con status 0", async () => {
    mockFetch([new TypeError("Network request failed")]);
    const client = createApiClient("https://api.test", memoryStore(tokens), () => undefined);

    await expect(client.request("GET", "/api/grupos")).rejects.toMatchObject({
      status: 0,
      isNetworkError: true,
    });
  });

  it("las rutas publicas no mandan token ni intentan renovar", async () => {
    const calls = mockFetch([jsonResponse(401, { error: "Correo o contrasena incorrectos" })]);
    const client = createApiClient("https://api.test", memoryStore(null), () => undefined);

    await expect(
      client.request("POST", "/api/auth/login", { email: "a@b.co", password: "x" }, false),
    ).rejects.toMatchObject({ status: 401, message: "Correo o contrasena incorrectos" });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.authorization).toBeNull();
  });
});
