import { describe, it, expect, vi, afterEach } from "vitest";

const Trajet = require("../../src/models/Trajet");
const analyticsService = require("../../src/services/analyticsService");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AnalyticsService - eco performance", () => {
  it("retourne les indicateurs calculés", async () => {
    const donnees = [
      {
        chauffeur: "chauffeur123",
        distanceTotale: 1200,
        carburantTotal: 120,
        consommationMoyenne: 10,
      },
    ];

    vi.spyOn(Trajet, "aggregate").mockResolvedValue(donnees);

    const resultat = await analyticsService.getDriversEcoPerformance();

    expect(resultat).toEqual(donnees);
    expect(Trajet.aggregate).toHaveBeenCalledOnce();
  });

  it("gère une agrégation vide", async () => {
    vi.spyOn(Trajet, "aggregate").mockResolvedValue([]);

    const resultat = await analyticsService.getDriversEcoPerformance();

    expect(resultat).toEqual([]);
  });

  it("propage une erreur MongoDB", async () => {
    vi.spyOn(Trajet, "aggregate").mockRejectedValue(
      new Error("Erreur MongoDB")
    );

    await expect(
      analyticsService.getDriversEcoPerformance()
    ).rejects.toThrow("Erreur MongoDB");
  });
});