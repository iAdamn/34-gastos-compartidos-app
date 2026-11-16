import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import * as api from "@/api/api";
import { clearAll } from "@/repositories/groupsRepository";
import { signIn } from "@/services/authService";
import { loadDataOwner, saveDataOwner } from "@/services/session";

jest.mock("@/api/api");
jest.mock("@/db/database", () => ({ getDatabase: async () => ({}) }));
jest.mock("@/repositories/groupsRepository");
jest.mock("@/services/session", () => ({
  tokenStore: { set: jest.fn(), clear: jest.fn(), get: jest.fn() },
  saveUser: jest.fn(),
  loadDataOwner: jest.fn(),
  saveDataOwner: jest.fn(),
}));

function sessionOf(id: string) {
  return { token: "t", refreshToken: "r", usuario: { id, email: `${id}@correo.test` } };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("datos guardados al iniciar sesion", () => {
  it("si entra otra persona se borran los datos del usuario anterior", async () => {
    jest.mocked(loadDataOwner).mockResolvedValue("ana");
    jest.mocked(api.login).mockResolvedValue(sessionOf("beto"));

    await signIn("beto@correo.test", "12345678");

    expect(clearAll).toHaveBeenCalledTimes(1);
    expect(saveDataOwner).toHaveBeenCalledWith("beto");
  });

  it("si vuelve a entrar la misma persona se conservan los datos y los pendientes", async () => {
    jest.mocked(loadDataOwner).mockResolvedValue("ana");
    jest.mocked(api.login).mockResolvedValue(sessionOf("ana"));

    await signIn("ana@correo.test", "12345678");

    expect(clearAll).not.toHaveBeenCalled();
  });

  it("la primera vez no hay nada que borrar", async () => {
    jest.mocked(loadDataOwner).mockResolvedValue(null);
    jest.mocked(api.login).mockResolvedValue(sessionOf("ana"));

    await signIn("ana@correo.test", "12345678");

    expect(clearAll).not.toHaveBeenCalled();
    expect(saveDataOwner).toHaveBeenCalledWith("ana");
  });
});
