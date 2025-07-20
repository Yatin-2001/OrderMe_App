const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);
router.put('/:id/confirm-delivery', orderController.confirmDelivery);
router.put('/:id/refund', orderController.initiateRefund);

module.exports = router;
