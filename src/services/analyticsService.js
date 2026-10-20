const Pneu = require("../models/Pneu");
const Trajet = require("../models/Trajet");

const getDriversEcoPerformance = async () => {
  return Trajet.aggregate([
    {
      $match: {
        statut: "termine",
      },
    },

    {
      $set: {
        distanceKm: {
          $subtract: ["$kilometrageArrivee", "$kilometrageDepart"],
        },
      },
    },

    {
      $match: {
        distanceKm: { $gt: 0 },
        carburantConsomme: { $gt: 0 },
      },
    },

    {
      $group: {
        _id: "$chauffeur",
        nombreTrajets: { $sum: 1 },
        distanceTotaleKm: { $sum: "$distanceKm" },
        carburantTotalLitres: {
          $sum: "$carburantConsomme",
        },
      },
    },

    {
      $set: {
        consommationMoyenne: {
          $multiply: [
            {
              $divide: ["$carburantTotalLitres", "$distanceTotaleKm"],
            },
            100,
          ],
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "chauffeur",
      },
    },

    {
      $unwind: "$chauffeur",
    },

    {
      $set: {
        scoreEcoConduite: {
          $max: [
            0,
            {
              $min: [
                100,
                {
                  $subtract: [
                    100,
                    {
                      $multiply: [
                        {
                          $subtract: ["$consommationMoyenne", 30],
                        },
                        2.5,
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,
        chauffeurId: "$chauffeur._id",
        nom: "$chauffeur.nom",
        email: "$chauffeur.email",
        nombreTrajets: 1,
        distanceTotaleKm: {
          $round: ["$distanceTotaleKm", 2],
        },
        carburantTotalLitres: {
          $round: ["$carburantTotalLitres", 2],
        },
        consommationMoyenneL100Km: {
          $round: ["$consommationMoyenne", 2],
        },
        scoreEcoConduite: {
          $round: ["$scoreEcoConduite", 2],
        },
      },
    },

    {
      $sort: {
        scoreEcoConduite: -1,
      },
    },
  ]);
};

const getTiresHealthMatrix = async () => {
  return Pneu.aggregate([
    {
      $match: {
        etat: { $ne: "a_remplacer" },
        kilometrageUsure: {
          $type: "number",
          $gte: 0,
        },
        seuilUsure: {
          $type: "number",
          $gte: 0,
        },
      },
    },

    {
      $addFields: {
        remainingKm: {
          $max: [
            0,
            {
              $subtract: ["$seuilUsure", "$kilometrageUsure"],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        isCritical: {
          $lt: ["$remainingKm", 5000],
        },
      },
    },

    {
      $group: {
        _id: "$camion",
        reference: { $first: "$reference" },
        nombrePneus: { $sum: 1 },
        kilometrageMoyen: { $avg: "$kilometrageUsure" },
        nombrePneusCritiques: {
          $sum: {
            $cond: ["$isCritical", 1, 0],
          },
        },
        budgetEstimeMAD: {
          $sum: {
            $cond: ["$isCritical", 3800, 0],
          },
        },
      },
    },
  ]);
};

const getFinancialEnergetique = async ({ startDate, endDate } = {}) => {
  const dateFilter = {};

  if (startDate || endDate) {
    dateFilter.dateDepart = {};

    if (startDate) {
      dateFilter.dateDepart.$gte = new Date(startDate);
    }

    if (endDate) {
      dateFilter.dateDepart.$lte = new Date(endDate);
    }
  }

  return Trajet.aggregate([
    {
      $match: {
        statut: "termine",
        ...dateFilter,
        kilometrageArrivee: { $type: "number" },
        kilometrageDepart: { $type: "number" },
        carburantConsomme: { $type: "number", $gte: 0 },
      },
    },

    {
      $addFields: {
        distanceKm: {
          $subtract: ["$kilometrageArrivee", "$kilometrageDepart"],
        },
      },
    },

    {
      $match: {
        distanceKm: { $gt: 0 },
      },
    },

    {
      $group: {
        _id: {
          origine: "$origine",
          destination: "$destination",
        },
        nombreTrajets: { $sum: 1 },
        distanceTotaleKm: { $sum: "$distanceKm" },
        carburantTotalLitres: { $sum: "$carburantConsomme" },
      },
    },

    {
      $addFields: {
        consommationMoyenneL100Km: {
          $multiply: [
            {
              $divide: ["$carburantTotalLitres", "$distanceTotaleKm"],
            },
            100,
          ],
        },
        emissionsCO2Tonnes: {
          $divide: [{ $multiply: ["$carburantTotalLitres", 2.68] }, 1000],
        },
      },
    },

    {
      $project: {
        _id: 0,
        origine: "$_id.origine",
        destination: "$_id.destination",
        nombreTrajets: 1,
        distanceTotaleKm: { $round: ["$distanceTotaleKm", 2] },
        carburantTotalLitres: { $round: ["$carburantTotalLitres", 2] },
        consommationMoyenneL100Km: {
          $round: ["$consommationMoyenneL100Km", 2],
        },
        emissionsCO2Tonnes: { $round: ["$emissionsCO2Tonnes", 4] },
      },
    },

    { $sort: { emissionsCO2Tonnes: -1 } },
  ]);
};

const getFleetUtilizationTrends = async ({ startDate, endDate } = {}) => {
  const dateFilter = {};

  if (startDate || endDate) {
    dateFilter.dateDepart = {};

    if (startDate) {
      dateFilter.dateDepart.$gte = new Date(startDate);
    }

    if (endDate) {
      dateFilter.dateDepart.$lte = new Date(endDate);
    }
  }

  return Trajet.aggregate([
    {
      $match: {
        statut: "termine",
        ...dateFilter,
        dateDepart: { ...dateFilter.dateDepart, $type: "date" },
        dateArrivee: { $type: "date" },
        camion: { $ne: null },
      },
    },

    {
      $addFields: {
        dureeMissionHeures: {
          $divide: [
            { $subtract: ["$dateArrivee", "$dateDepart"] },
            1000 * 60 * 60,
          ],
        },
      },
    },

    {
      $match: {
        dureeMissionHeures: { $gt: 0 },
      },
    },

    {
      $group: {
        _id: "$camion",
        nombreMissions: { $sum: 1 },
        tempsMissionHeures: { $sum: "$dureeMissionHeures" },
      },
    },

    {
      $project: {
        _id: 0,
        camion: "$_id",
        nombreMissions: 1,
        tempsMissionHeures: {
          $round: ["$tempsMissionHeures", 2],
        },
      },
    },

    {
      $sort: {
        tempsMissionHeures: -1,
      },
    },
  ]);
};

module.exports = {
  getDriversEcoPerformance,
  getTiresHealthMatrix,
  getFinancialEnergetique,
  getFleetUtilizationTrends
};
