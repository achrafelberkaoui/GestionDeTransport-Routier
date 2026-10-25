import { describe, it, expect } from "vitest";

describe("Calcul de consommation", () => {
  it("calcule la consommation moyenne aux 100 km", () => {
    const carburantConsomme = 60;
    const distance = 600;

    const consommation = (carburantConsomme / distance) * 100;

    expect(consommation).toBe(10);
  });
});