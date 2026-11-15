const express = require("express");
const authController = require("../../controllers/authController");
const router = express.Router();
const rateAuthLimiter = require("../../middleware/rateAuthLimiteMiddleware");
const {rateLimiter} = require("../../middleware/rateLimiteMiddleware");
const authenticate = require("../../middleware/authMiddleware");

router.post("/register", rateAuthLimiter, authController.register);
router.post("/login", rateAuthLimiter, authController.login);
router.get("/me", authenticate, rateLimiter, authController.me);
router.post("/logout", authController.logout);

module.exports = router;
