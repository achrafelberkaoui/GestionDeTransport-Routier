const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve users",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    let status = 500;

    if (error.message === "User not found") status = 404;
    else if (error.message === "Email already exists") status = 409;
    else if (error.name === "CastError" || error.name === "ValidationError")
      status = 400;

    res.status(status).json({
      message: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id, req.user.id);

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
      },
    });
  } catch (error) {
    let status = 500;

    if (error.message === "User not found") status = 404;
    else if (error.message === "You cannot delete your own account")
      status = 403;
    else if (error.name === "CastError") status = 400;

    res.status(status).json({
      message: error.message,
    });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
