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

module.exports = { getDriversEcoPerformance };
