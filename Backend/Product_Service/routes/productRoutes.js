const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

// Public / Admin APIs
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductByIdREST);

// Admin-only (if using auth later)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
