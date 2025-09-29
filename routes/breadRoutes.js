const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createBread,
  getBreads,
  getBreadById,
  updateBread,
  deleteBread,
} = require("../controllers/breadController");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("photo"), createBread);
router.get("/", getBreads);
router.get("/:id", getBreadById);
router.put("/:id", upload.single("photo"), updateBread);
router.delete("/:id", deleteBread);

module.exports = router;
