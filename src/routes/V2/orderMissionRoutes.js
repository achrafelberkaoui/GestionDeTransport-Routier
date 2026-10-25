const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");
const genererOrdreMission = require("../../controllers/trajetController");

router.post(
  "/:id/ordre-mission",
  authenticate,
  authorize("admin"),
  genererOrdreMission.genererOrdreMission,
);

router.get(
  "/:id/ordre-mission/telecharger",
  authenticate,
  authorize("admin"),
  genererOrdreMission.telechargerOrdreMission,
);

module.exports = router;

