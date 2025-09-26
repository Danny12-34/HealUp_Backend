const express = require('express');
const router = express.Router();
const beverageController = require('../controllers/menuBeverageController');
const multer = require('multer');
const path = require('path');

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  }
});

const upload = multer({ storage: storage });

router.get('/', beverageController.getBeverages);
router.get('/:id', beverageController.getBeverageById);
router.post('/', upload.single('photo'), beverageController.createBeverage);
router.put('/:id', upload.single('photo'), beverageController.updateBeverage);
router.delete('/:id', beverageController.deleteBeverage);

module.exports = router;
