const express = require('express');
const router = express.Router();
const mealController = require('../controllers/menuMealController');
const multer = require('multer');
const path = require('path');

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', mealController.getMeals);
router.get('/:id', mealController.getMealById);
router.post('/', upload.single('photo'), mealController.createMeal);
router.put('/:id', upload.single('photo'), mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
