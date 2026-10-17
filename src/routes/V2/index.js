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

module.exports = router;
