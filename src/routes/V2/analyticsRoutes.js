const express = require('express');
const router = express.Router();
const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");
const analyticsController = require("../../controllers/analyticsController")


router.get(
  "/drivers/eco-performance",
  authenticate,
  authorize("admin"),
  analyticsController.getDriversEcoPerformance,
);
router.get(
  "/tires/health-matrix",
  authenticate,
  authorize("admin"),
  analyticsController.getTiresHealthMatrix,
);
router.get(
  "/trips/financial-esg",
  authenticate,
  authorize("admin"),
  analyticsController.getFinancialEnergetique,
);
router.get(
  "/fleet/utilization-trends",
  authenticate,
  authorize("admin"),
  analyticsController.getFleetUtilizationTrends,
);

module.exports = router;
