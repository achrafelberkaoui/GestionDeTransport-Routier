const User = require("../models/User");
const user = require("../models/User");
const bcrypt = require("bcryptjs");
const getAllUsers = async (req, res) => {
  const users = await user.find().select("-password");
  return users;
};

const createUser = async (userData) => {
  const { nom, email, password, role, statut } = userData;
  if (!email) {
    throw new Error("enter the Email");
  }
  if (!password) {
    throw new Error("enter the password");
  }
  if (!nom) {
    throw new Error("enter the name");
  }
  const existingUser = await user.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await user.create({
    nom,
    password: hashedPassword,
    email,
    role,
    statut,
  });

  return newUser;
};

const updateUser = async (id, userData) => {
  const existingUser = await user.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (userData.email) {
    const emailExists = await user.findOne({
      email: userData.email,
      _id: { $ne: id },
    });

    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const updatedUser = await user
    .findByIdAndUpdate(id, userData, { new: true, runValidators: true })
    .select("-password");

  return updatedUser;
};

const deleteUser = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new Error("You cannot delete your own account");
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new Error("User not found");
  }

  return deletedUser;
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
