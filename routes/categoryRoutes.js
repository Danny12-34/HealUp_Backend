const express = require('express');
const router = express.Router();
const { 
    getCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    upload 
} = require('../controllers/categoryController');

// Routes
router.get('/', getCategories);                       // Get all categories
router.get('/:id', getCategoryById);                  // Get single category
router.post('/', upload.single('category_image'), createCategory);   // Create with optional image
router.put('/:id', upload.single('category_image'), updateCategory); // Update with optional image
router.delete('/:id', deleteCategory);               // Delete category

module.exports = router;
