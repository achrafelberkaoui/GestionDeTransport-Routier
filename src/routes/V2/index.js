const express = require("express");

const router = express.Router();
const analyticsController = require("../../controllers/analyticsController");
const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");

router.get("/", (req, res) => {
  res.json({
    message: "FleetTrackPRO API V2 is running",
    version: "2.0",
  });
});

router.get(
  "/analytics/drivers/eco-performance",
  authenticate,
  authorize("admin"),
  analyticsController.getDriversEcoPerformance,
);
router.get(
  "/analytics/tires/health-matrix",
  authenticate,
  authorize("admin"),
  analyticsController.getTiresHealthMatrix,
);
router.get(
  "/analytics/trips/financial-esg",
  authenticate,
  authorize("admin"),
  analyticsController.getFinancialEnergetique,
);
router.get(
  "/analytics/fleet/utilization-trends",
  authenticate,
  authorize("admin"),
  analyticsController.getFleetUtilizationTrends,
);

module.exports = router;
