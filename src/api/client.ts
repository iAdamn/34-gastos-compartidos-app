// Cliente HTTP de la app: agrega el token, renueva la sesion una vez si la API responde 401
// y convierte los errores a un solo tipo.

export type Tokens = { token: string; refreshToken: string };

// Donde se guardan los tokens. En la app es expo-secure-store; en las pruebas, memoria.
export type TokenStore = {
  get: () => Promise<Tokens | null>;
  set: (tokens: Tokens) => Promise<void>;
  clear: () => Promise<void>;
};

export class ApiClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }

  // status 0 significa que no hubo respuesta: sin conexion o la API caida.
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export type ApiClient = {
  request: <T>(method: string, path: string, body?: unknown, withAuth?: boolean) => Promise<T>;
};

type RawResponse = { status: number; data: unknown };

// Saca el mensaje de error del formato { error: "..." } de la API.
function errorMessage(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    return String(data.error);
  }
  return "Error inesperado";
}

async function send(
  url: string,
  method: string,
  body: unknown,
  token?: string,
): Promise<RawResponse> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError(0, "Sin conexion");
  }
  const data: unknown = await response.json().catch(() => null);
  return { status: response.status, data };
}

export function createApiClient(
  baseUrl: string,
  store: TokenStore,
  onSessionExpired: () => void,
): ApiClient {
  // Pide un token nuevo con el refreshToken. Devuelve null si la sesion ya no sirve.
  // Si la API falla por otra cosa (500, 429) lanza el error y la sesion se conserva.
  async function refresh(current: Tokens): Promise<Tokens | null> {
    const result = await send(`${baseUrl}/api/auth/refresh`, "POST", {
      refreshToken: current.refreshToken,
    });
    if (result.status === 400 || result.status === 401) {
      return null;
    }
    if (result.status !== 200 || typeof result.data !== "object" || result.data === null) {
      throw new ApiClientError(result.status, errorMessage(result.data));
    }
    const data: { token?: unknown; refreshToken?: unknown } = result.data;
    const renewed = { token: String(data.token), refreshToken: String(data.refreshToken) };
    await store.set(renewed);
    return renewed;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    withAuth = true,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const tokens = withAuth ? await store.get() : null;
    let result = await send(url, method, body, tokens?.token);
    if (result.status === 401 && withAuth && tokens) {
      const renewed = await refresh(tokens);
      if (!renewed) {
        await store.clear();
        onSessionExpired();
        throw new ApiClientError(401, "La sesion vencio. Inicia sesion de nuevo");
      }
      // Un solo reintento con el token nuevo.
      result = await send(url, method, body, renewed.token);
    }
    if (result.status < 200 || result.status >= 300) {
      throw new ApiClientError(result.status, errorMessage(result.data));
    }
    // La forma de la respuesta la define docs/contrato-api.md.
    return result.data as T;
  }

  return { request };
}
