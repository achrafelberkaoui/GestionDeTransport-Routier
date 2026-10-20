const { date } = require("joi");
const analyticsService = require("../services/analyticsService");
const getDriversEcoPerformance = async (req, res) => {
  try {
    const performances = await analyticsService.getDriversEcoPerformance();

    return res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });
  } catch (error) {
    console.error("Erreur eco-performance :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des performances écologiques.",
    });
  }
};

const getTiresHealthMatrix = async (req, res) => {
  try {
    const matrix = await analyticsService.getTiresHealthMatrix();

    return res.status(200).json({
      success: true,
      count: matrix.length,
      data: matrix,
    });
  } catch (error) {
    console.error("Erreur tires health-matrix :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du bilan de santé des pneus.",
    });
  }
};

const getFinancialEnergetique = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (
      (startDate && isNaN(Date.parse(startDate))) ||
      (endDate && isNaN(Date.parse(endDate)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Les dates fournies sont invalides.",
      });
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "startDate doit être antérieure ou égale à endDate.",
      });
    }
    const data = await analyticsService.getFinancialEnergetique({
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Erreur financial ESG :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du calcul financier et énergétique.",
    });
  }
};

const getFleetUtilizationTrends = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        message: "startDate invalide",
      });
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        message: "endDate invalide",
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "startDate doit être antérieure à endDate",
      });
    }

    const data = await analyticsService.getFleetUtilizationTrends({
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDriversEcoPerformance,
  getTiresHealthMatrix,
  getFinancialEnergetique,
  getFleetUtilizationTrends,
};
