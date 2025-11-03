const express = require("express");
const router = express.Router();
const userController = require("../controllers/authController");

// CRUD
router.post("/create", userController.createUser);
router.get("/all", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Auth
router.post("/login", userController.login);
router.post("/verify-otp", userController.verifyOtp);

module.exports = router;
