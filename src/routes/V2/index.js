const express = require("express");

const orderMissionRoutes = require("./orderMissionRoutes");
const AnalyticsRoutes = require("./analyticsRoutes");
const router = express.Router();

router.use("/analytics", AnalyticsRoutes);
router.use("/trajets", orderMissionRoutes);

router.get("/", (req, res) => {
  res.json({
    message: "FleetTrackPRO API V2 is running",
    version: "2.0",
  });
});

module.exports = router;
