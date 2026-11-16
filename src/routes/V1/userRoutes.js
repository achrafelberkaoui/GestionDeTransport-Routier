const express = require("express");
const userController = require("../../controllers/userController");
const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validate");
const createUserSchema = require("../../dto/user/createUser.dto");
const updateUserSchema = require("../../dto/user/updateUser.dto");
const router = express.Router();

router.get("/", authenticate, authorize("admin"), userController.getAllUsers);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createUserSchema),
  userController.createUser,
);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser,
);

module.exports = router;
