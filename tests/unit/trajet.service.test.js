import { describe, it, expect, vi, afterEach } from "vitest";

const Trajet = require("../../src/models/Trajet");
const Camion = require("../../src/models/Camion");
const Remorque = require("../../src/models/Remorque");
const User = require("../../src/models/User");
const maintenanceService = require("../../src/services/maintenanceService");
const trajetService = require("../../src/services/trajetService");

afterEach(() => {
  vi.restoreAllMocks();
});

// Simule une requête Mongoose avec plusieurs populate()
const mockQuery = (result) => {
  const query = {
    populate: vi.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  return query;
};

const camionValide = () => ({
  _id: "camion123",
  statut: "disponible",
  kilometrage: 1000,
  save: vi.fn().mockResolvedValue(true),
});

const remorqueValide = () => ({
  _id: "remorque123",
  statut: "disponible",
});

const chauffeurValide = () => ({
  _id: "chauffeur123",
  role: "driver",
  statut: "actif",
});

const trajetValide = () => ({
  _id: "trajet123",
  camion: "camion123",
  remorque: "remorque123",
  chauffeur: "chauffeur123",
  statut: "en_cours",
  kilometrageDepart: 1000,
  save: vi.fn().mockResolvedValue(true),
});

const donneesTrajet = {
  origine: "Casablanca",
  destination: "Rabat",
  dateDepart: new Date("2026-10-25"),
  camion: "camion123",
  remorque: "remorque123",
  chauffeur: "chauffeur123",
};

describe("TrajetService - createTrajet", () => {
  it("crée un trajet avec des ressources valides", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(Remorque, "findById").mockResolvedValue(remorqueValide());
    vi.spyOn(User, "findById").mockResolvedValue(chauffeurValide());
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Trajet, "create").mockResolvedValue({ _id: "trajet123" });

    const resultat = { _id: "trajet123" };
    vi.spyOn(Trajet, "findById").mockImplementation(() =>
      mockQuery(resultat)
    );
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);

    const resultatTrajet = await trajetService.createTrajet(donneesTrajet);

    expect(Trajet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        origine: "Casablanca",
        destination: "Rabat",
        kilometrageDepart: 1000,
      })
    );
    expect(resultatTrajet).toEqual(resultat);
  });

  it("refuse un camion inexistant", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(null);

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Camion not found");
  });

  it("refuse un camion indisponible", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue({
      ...camionValide(),
      statut: "en_maintenance",
    });
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Camion is not available");
  });

  it("refuse un camion ayant déjà un trajet actif", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue({ _id: "autreTrajet" });

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Camion already has an active trajet");
  });

  it("refuse une remorque inexistante", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Remorque, "findById").mockResolvedValue(null);

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Remorque not found");
  });

  it("refuse une remorque indisponible", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Remorque, "findById").mockResolvedValue({
      ...remorqueValide(),
      statut: "en_maintenance",
    });

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Remorque is not available");
  });

  it("refuse une remorque ayant déjà un trajet actif", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: "autreTrajet" });
    vi.spyOn(Remorque, "findById").mockResolvedValue(remorqueValide());

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Remorque already has an active trajet");
  });

  it("refuse un chauffeur inexistant", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Remorque, "findById").mockResolvedValue(remorqueValide());
    vi.spyOn(User, "findById").mockResolvedValue(null);

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Chauffeur not found");
  });

  it("refuse un utilisateur qui n'est pas chauffeur", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Remorque, "findById").mockResolvedValue(remorqueValide());
    vi.spyOn(User, "findById").mockResolvedValue({
      ...chauffeurValide(),
      role: "admin",
    });

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Chauffeur is not a driver");
  });

  it("refuse un chauffeur inactif", async () => {
    vi.spyOn(Camion, "findById").mockResolvedValue(camionValide());
    vi.spyOn(maintenanceService, "verifierBlocageCamion")
      .mockResolvedValue(undefined);
    vi.spyOn(Trajet, "findOne").mockResolvedValue(null);
    vi.spyOn(Remorque, "findById").mockResolvedValue(remorqueValide());
    vi.spyOn(User, "findById").mockResolvedValue({
      ...chauffeurValide(),
      statut: "inactif",
    });

    await expect(
      trajetService.createTrajet(donneesTrajet)
    ).rejects.toThrow("Chauffeur is not active");
  });
});

describe("TrajetService - getAllTrajets", () => {
  it("retourne la liste des trajets", async () => {
    const trajets = [{ _id: "trajet123" }];

    vi.spyOn(Trajet, "find").mockImplementation(() => mockQuery(trajets));

    await expect(trajetService.getAllTrajets()).resolves.toEqual(trajets);
  });
});

describe("TrajetService - getTrajetById", () => {
  it("retourne un trajet existant", async () => {
    const trajet = { _id: "trajet123" };

    vi.spyOn(Trajet, "findById").mockImplementation(() => mockQuery(trajet));

    await expect(
      trajetService.getTrajetById("trajet123")
    ).resolves.toEqual(trajet);
  });

  it("refuse un trajet inexistant", async () => {
    vi.spyOn(Trajet, "findById").mockImplementation(() => mockQuery(null));

    await expect(
      trajetService.getTrajetById("inexistant")
    ).rejects.toThrow("Trajet not found");
  });
});

describe("TrajetService - updateTrajet", () => {
  it("refuse un trajet inexistant", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue(null);

    await expect(
      trajetService.updateTrajet("inexistant", { statut: "annule" })
    ).rejects.toThrow("Trajet not found");
  });

  it("autorise le passage de planifie à en_cours", async () => {
    const trajet = {
      ...trajetValide(),
      statut: "planifie",
    };
    const resultat = { _id: "trajet123", statut: "en_cours" };

    vi.spyOn(Trajet, "findById")
      .mockResolvedValueOnce(trajet)
      .mockImplementationOnce(() => mockQuery(resultat));

    const reponse = await trajetService.updateTrajet("trajet123", {
      statut: "en_cours",
    });

    expect(trajet.statut).toBe("en_cours");
    expect(trajet.save).toHaveBeenCalled();
    expect(reponse).toEqual(resultat);
  });

  it("refuse de terminer par updateTrajet", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      ...trajetValide(),
      statut: "en_cours",
    });

    await expect(
      trajetService.updateTrajet("trajet123", { statut: "termine" })
    ).rejects.toThrow(
      "Utilise l'endpoint terminerTrajet pour terminer le trajet"
    );
  });

  it("refuse une transition de statut interdite", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      ...trajetValide(),
      statut: "termine",
    });

    await expect(
      trajetService.updateTrajet("trajet123", { statut: "en_cours" })
    ).rejects.toThrow("Transation Impossible termine vers en_cours");
  });

  it("met à jour la date d'arrivée", async () => {
    const dateArrivee = new Date("2026-10-26");
    const trajet = {
      ...trajetValide(),
      statut: "en_cours",
    };
    const resultat = { _id: "trajet123", dateArrivee };

    vi.spyOn(Trajet, "findById")
      .mockResolvedValueOnce(trajet)
      .mockImplementationOnce(() => mockQuery(resultat));

    await trajetService.updateTrajet("trajet123", { dateArrivee });

    expect(trajet.dateArrivee).toEqual(dateArrivee);
    expect(trajet.save).toHaveBeenCalled();
  });
});

describe("TrajetService - terminerTrajet", () => {
  it("refuse un trajet inexistant", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue(null);

    await expect(
      trajetService.terminerTrajet("inexistant", 1500, 50)
    ).rejects.toThrow("Trajet Not Found");
  });

  it("refuse un kilométrage final inférieur au kilométrage initial", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      kilometrageDepart: 1000,
    });

    await expect(
      trajetService.terminerTrajet("trajet123", 900, 50)
    ).rejects.toThrow(
      "Arrival mileage must be greater than departure mileage"
    );
  });

  it("refuse un kilométrage final égal au kilométrage initial", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      kilometrageDepart: 1000,
    });

    await expect(
      trajetService.terminerTrajet("trajet123", 1000, 50)
    ).rejects.toThrow(
      "Arrival mileage must be greater than departure mileage"
    );
  });

  it("refuse une consommation négative", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      kilometrageDepart: 1000,
    });

    await expect(
      trajetService.terminerTrajet("trajet123", 1200, -10)
    ).rejects.toThrow("Fuel consumption cannot be negative");
  });

  it("refuse un camion inexistant", async () => {
    vi.spyOn(Trajet, "findById").mockResolvedValue({
      ...trajetValide(),
      kilometrageDepart: 1000,
    });
    vi.spyOn(Camion, "findById").mockResolvedValue(null);

    await expect(
      trajetService.terminerTrajet("trajet123", 1200, 50)
    ).rejects.toThrow("Camion not found");
  });

  it("termine un trajet et calcule la distance et la consommation", async () => {
    const trajet = trajetValide();
    const camion = camionValide();
    const resultatTrajet = { _id: "trajet123", statut: "termine" };

    vi.spyOn(Trajet, "findById")
      .mockResolvedValueOnce(trajet)
      .mockImplementationOnce(() => mockQuery(resultatTrajet));

    vi.spyOn(Camion, "findById").mockResolvedValue(camion);

    vi.spyOn(maintenanceService, "mettreAJourUsurePneus")
      .mockResolvedValue(undefined);
    vi.spyOn(maintenanceService, "verifierMaintenance")
      .mockResolvedValue(undefined);

    const resultat = await trajetService.terminerTrajet(
      "trajet123",
      1200,
      40
    );

    expect(resultat.distance).toBe(200);
    expect(resultat.consommation).toBe(20);
    expect(trajet.statut).toBe("termine");
    expect(trajet.kilometrageArrivee).toBe(1200);
    expect(trajet.carburantConsomme).toBe(40);
    expect(camion.kilometrage).toBe(1200);
    expect(trajet.save).toHaveBeenCalled();
    expect(camion.save).toHaveBeenCalled();
    expect(maintenanceService.mettreAJourUsurePneus)
      .toHaveBeenCalledWith("camion123", 200);
    expect(maintenanceService.verifierMaintenance)
      .toHaveBeenCalledWith("camion123");
    expect(resultat.resultatTrajet).toEqual(resultatTrajet);
  });
});
