const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const requireAuth = require('../middleware/requireAuth');
const checkSysAdmin = require('../middleware/adminCheck');

router.get('/', requireAuth, productController.getAllProducts);
router.get('/:id', requireAuth, productController.getProductById);

// Admin-only (or internal service)
router.post('/', requireAuth, checkSysAdmin, productController.createProduct);
router.put('/:id', requireAuth, checkSysAdmin, productController.updateProduct);
router.delete('/:id', requireAuth, checkSysAdmin, productController.deleteProduct);

// Inventory Reservation (called by Order Service)
router.post('/reserve', requireAuth, productController.reserveInventory);
router.post('/release', requireAuth, productController.releaseInventory); // on cancel/refund
router.post('/finalize', requireAuth, productController.finalizeInventory); // on delivery

module.exports = router;
