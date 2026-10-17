const analyticsService = require("../services/analyticsService");
const getDriversEcoPerformance = async (req, res) => {
  try {
    const performances =
    await analyticsService.getDriversEcoPerformance();

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

module.exports = {
  getDriversEcoPerformance,
};
