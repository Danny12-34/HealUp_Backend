const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);         // GET all products
router.get('/:id', productController.getProductById);  // GET product by ID
router.post('/', productController.createProduct);     // CREATE product
router.put('/:id', productController.updateProduct);   // UPDATE product
router.delete('/:id', productController.deleteProduct);// DELETE product

module.exports = router;
