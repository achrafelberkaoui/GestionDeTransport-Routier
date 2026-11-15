const authService = require("../services/authService");
const User = require("../models/User")

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie("token", result.token, cookieOptions);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: result.user._id,
        nom: result.user.nom,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user || user.statut === "suspendu") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(401).json({
        message: "User not found or suspended",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur dans authController.me :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
