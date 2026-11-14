import { describe, expect, it } from "@jest/globals";

import cases from "../../docs/casos-dominio.json";
import { computeBalances } from "./balance";
import { generateGroupCode, isValidGroupCode, normalizeGroupCode } from "./groupCode";
import { formatCop, isValidAmount, pesosToCents } from "./money";
import { suggestPayments } from "./settle";
import { splitByPercent, splitEqually, type Shares } from "./split";

// Suma todos los valores de un reparto o de un balance.
function total(shares: Shares): number {
  return Object.values(shares).reduce((sum, value) => sum + value, 0);
}

// El JSON de casos trae objetos con llaves distintas en cada caso.
// Esta funcion los pasa al tipo Shares quitando las llaves sin valor.
function toShares(values: Record<string, number | undefined>): Shares {
  const shares: Shares = {};
  for (const [uid, value] of Object.entries(values)) {
    if (value !== undefined) {
      shares[uid] = value;
    }
  }
  return shares;
}

describe("dinero", () => {
  it("acepta solo enteros positivos multiplos de 100", () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(10000000)).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-100)).toBe(false);
    expect(isValidAmount(150)).toBe(false);
    expect(isValidAmount(100.5)).toBe(false);
  });

  it("convierte pesos a centavos", () => {
    expect(pesosToCents(100000)).toBe(10000000);
  });

  it("muestra los pesos con miles y ,00", () => {
    expect(formatCop(10000000)).toBe("$100.000,00");
    expect(formatCop(100)).toBe("$1,00");
    expect(formatCop(0)).toBe("$0,00");
    expect(formatCop(-4000000)).toBe("-$40.000,00");
    expect(formatCop(123456700)).toBe("$1.234.567,00");
  });
});

describe("reparto en partes iguales", () => {
  it.each(cases.reparto_igual)("$nombre", ({ monto_centavos, participantes, esperado }) => {
    const shares = splitEqually(monto_centavos, participantes);

    expect(shares).toEqual(esperado);
    expect(total(shares)).toBe(monto_centavos);
  });

  it("rechaza participantes repetidos", () => {
    expect(() => splitEqually(1000, ["a", "a"])).toThrow();
  });
});

describe("reparto por porcentajes", () => {
  it.each(cases.reparto_porcentajes)("$nombre", ({ monto_centavos, porcentajes, esperado }) => {
    const shares = splitByPercent(monto_centavos, toShares(porcentajes));

    expect(shares).toEqual(esperado);
    expect(total(shares)).toBe(monto_centavos);
  });

  it("rechaza porcentajes con decimales", () => {
    expect(() => splitByPercent(1000, { a: 50.5, b: 49.5 })).toThrow();
  });
});

describe("reparto invalido", () => {
  it.each(cases.reparto_invalido)("$nombre", (invalidCase) => {
    const { monto_centavos } = invalidCase;

    if ("porcentajes" in invalidCase && invalidCase.porcentajes) {
      const percents = toShares(invalidCase.porcentajes);
      expect(() => splitByPercent(monto_centavos, percents)).toThrow();
    } else {
      const participants = "participantes" in invalidCase ? (invalidCase.participantes ?? []) : [];
      expect(() => splitEqually(monto_centavos, participants)).toThrow();
    }
  });
});

describe("balance", () => {
  it.each(cases.balance)("$nombre", ({ miembros, gastos, pagos, esperado }) => {
    const balances = computeBalances(miembros, gastos, pagos);

    expect(balances).toEqual(esperado);
    expect(total(balances)).toBe(0);
  });

  it("usa los porcentajes cuando el gasto los trae", () => {
    const expense = {
      pagador_uid: "a",
      monto_centavos: 1000000,
      participantes: ["a", "b"],
      porcentajes: { a: 70, b: 30 },
    };

    expect(computeBalances(["a", "b"], [expense], [])).toEqual({ a: 300000, b: -300000 });
  });

  it("ignora a quien no es miembro del grupo", () => {
    const balances = computeBalances(["a"], [], [{ de_uid: "x", a_uid: "a", monto_centavos: 100 }]);

    expect(balances).toEqual({ a: -100 });
  });
});

describe("pagos sugeridos", () => {
  it.each(cases.pagos_sugeridos)("$nombre", ({ saldos, esperado }) => {
    const balances = toShares(saldos);
    const payments = suggestPayments(balances);

    expect(payments).toEqual(esperado);

    // Propiedad: aplicar los pagos deja a todos en 0, con maximo n - 1 pagos.
    const after: Shares = { ...balances };
    for (const payment of payments) {
      after[payment.de_uid] = (after[payment.de_uid] ?? 0) + payment.monto_centavos;
      after[payment.a_uid] = (after[payment.a_uid] ?? 0) - payment.monto_centavos;
    }
    expect(Object.values(after).every((value) => value === 0)).toBe(true);
    expect(payments.length).toBeLessThanOrEqual(Math.max(Object.keys(balances).length - 1, 0));
  });

  it("rechaza saldos que no suman cero", () => {
    expect(() => suggestPayments({ a: 100, b: 0 })).toThrow();
  });
});

describe("codigo de grupo", () => {
  it("normaliza a mayusculas y sin espacios", () => {
    expect(normalizeGroupCode(" ab2cd3 ")).toBe("AB2CD3");
  });

  it("valida el largo y los caracteres permitidos", () => {
    expect(isValidGroupCode("AB2CD3")).toBe(true);
    expect(isValidGroupCode("AB2CD")).toBe(false);
    expect(isValidGroupCode("AB2CD34")).toBe(false);
    expect(isValidGroupCode("AB0CD1")).toBe(false);
    expect(isValidGroupCode("")).toBe(false);
  });

  it("genera codigos validos usando el azar que recibe", () => {
    expect(generateGroupCode(() => 0)).toBe("AAAAAA");
    expect(isValidGroupCode(generateGroupCode(Math.random))).toBe(true);
    expect(isValidGroupCode(generateGroupCode(() => 0.999999))).toBe(true);
  });
});
