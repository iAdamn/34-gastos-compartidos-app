import {
  changePercent,
  evenPercents,
  percentTotal,
  toggleParticipant,
} from "@/components/expense-form/percents";

describe("porcentajes del formulario de gasto", () => {
  it("reparte 100 en partes iguales y el sobrante va al uid menor", () => {
    expect(evenPercents(["u3", "u1", "u2"])).toEqual({ u1: 34, u2: 33, u3: 33 });
    expect(evenPercents(["u1", "u2"])).toEqual({ u1: 50, u2: 50 });
    expect(evenPercents([])).toEqual({});
  });

  it("suma los porcentajes", () => {
    expect(percentTotal({ u1: 34, u2: 33, u3: 33 })).toBe(100);
  });

  it("sube y baja de a 5 sin pasar de 1 a 100", () => {
    expect(changePercent({ u1: 50, u2: 50 }, "u1", 5)).toEqual({ u1: 55, u2: 50 });
    expect(changePercent({ u1: 3 }, "u1", -5)).toEqual({ u1: 1 });
    expect(changePercent({ u1: 98 }, "u1", 5)).toEqual({ u1: 100 });
  });

  it("marca y desmarca un participante", () => {
    expect(toggleParticipant(["u1"], "u2")).toEqual(["u1", "u2"]);
    expect(toggleParticipant(["u1", "u2"], "u1")).toEqual(["u2"]);
  });
});
