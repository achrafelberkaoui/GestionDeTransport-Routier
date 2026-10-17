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

module.exports = {
  getDriversEcoPerformance,
  getTiresHealthMatrix
};
