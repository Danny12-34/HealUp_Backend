const express = require('express');
const router = express.Router();
const tipsController = require('../controllers/nutritionTipsController');

// Get all nutrition tips
router.get('/', tipsController.getAllTips);

// Get single tip by ID
router.get('/:id', tipsController.getTipById);

// Create a new tip
router.post('/', tipsController.createTip);

// Update a tip
router.put('/:id', tipsController.updateTip);

// Delete a tip
router.delete('/:id', tipsController.deleteTip);

module.exports = router;
