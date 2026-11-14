import { describe, expect, it, jest } from "@jest/globals";

import { validateCredentials } from "./authService";
import { canDelete, parsePesos, validateExpenseForm, type ExpenseForm } from "./expensesService";
import { validateGroupForm, validateJoinForm } from "./groupsService";

// Estas pruebas solo revisan funciones puras. Los modulos nativos se reemplazan por vacios.
jest.mock("expo-secure-store", () => ({}));
jest.mock("expo-sqlite", () => ({}));
jest.mock("expo-crypto", () => ({}));

const form: ExpenseForm = {
  descripcion: "Mercado",
  pesos: "100.000",
  pagador_uid: "ana",
  participantes: ["ana", "beto", "caro"],
  porcentajes: null,
};

describe("monto escrito por el usuario", () => {
  it("acepta pesos enteros con o sin puntos de miles", () => {
    expect(parsePesos("100000")).toBe(10000000);
    expect(parsePesos("100.000")).toBe(10000000);
    expect(parsePesos("$ 1.500")).toBe(150000);
  });

  it("rechaza cero, negativos, decimales y texto", () => {
    expect(parsePesos("0")).toBeNull();
    expect(parsePesos("-500")).toBeNull();
    expect(parsePesos("100,50")).toBeNull();
    expect(parsePesos("abc")).toBeNull();
    expect(parsePesos("")).toBeNull();
  });
});

describe("formulario de gasto", () => {
  it("un gasto completo no tiene errores", () => {
    expect(validateExpenseForm(form)).toBeNull();
  });

  it.each([
    ["descripcion vacia", { descripcion: "  " }],
    ["descripcion de 81 caracteres", { descripcion: "x".repeat(81) }],
    ["monto invalido", { pesos: "abc" }],
    ["sin participantes", { participantes: [] }],
    ["porcentajes que no suman 100", { porcentajes: { ana: 50, beto: 30, caro: 19 } }],
  ])("avisa con %s", (_name, change) => {
    expect(validateExpenseForm({ ...form, ...change })).not.toBeNull();
  });

  it("acepta porcentajes que suman 100", () => {
    const withPercents = { ...form, porcentajes: { ana: 50, beto: 30, caro: 20 } };

    expect(validateExpenseForm(withPercents)).toBeNull();
  });
});

describe("quien puede eliminar un gasto", () => {
  it("solo quien lo creo", () => {
    const expense = {
      id: "e1",
      grupo_id: "g1",
      pagador_uid: "beto",
      descripcion: "Taxi",
      monto_centavos: 100,
      participantes: ["ana"],
      porcentajes: null,
      fecha: "2026-11-14",
      creado_por: "ana",
      synced: true,
      deleted: false,
      pending: false,
    };

    expect(canDelete(expense, "ana")).toBe(true);
    expect(canDelete(expense, "beto")).toBe(false);
  });
});

describe("formularios de grupo", () => {
  it("crear grupo pide nombre del grupo y nombre propio", () => {
    expect(validateGroupForm("Paseo", "Ana")).toBeNull();
    expect(validateGroupForm("", "Ana")).not.toBeNull();
    expect(validateGroupForm("x".repeat(41), "Ana")).not.toBeNull();
    expect(validateGroupForm("Paseo", " ")).not.toBeNull();
  });

  it("unirse pide un codigo de 6 caracteres", () => {
    expect(validateJoinForm("abc234", "Beto")).toBeNull();
    expect(validateJoinForm("abc23", "Beto")).not.toBeNull();
    expect(validateJoinForm("abc2345", "Beto")).not.toBeNull();
    expect(validateJoinForm("", "Beto")).not.toBeNull();
    expect(validateJoinForm("abc234", "")).not.toBeNull();
  });
});

describe("formulario de login", () => {
  it("pide correo valido y contrasena de 8 o mas", () => {
    expect(validateCredentials("ana@correo.co", "12345678")).toBeNull();
    expect(validateCredentials("ana", "12345678")).not.toBeNull();
    expect(validateCredentials("ana@correo.co", "1234567")).not.toBeNull();
  });
});
