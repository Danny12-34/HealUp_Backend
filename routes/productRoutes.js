const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Folder to save images
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Routes with image upload support
router.get('/', productController.getProducts);         
router.get('/:id', productController.getProductById);  
router.post('/', upload.single('image'), productController.createProduct);     
router.put('/:id', upload.single('image'), productController.updateProduct);   
router.delete('/:id', productController.deleteProduct);

module.exports = router;
    