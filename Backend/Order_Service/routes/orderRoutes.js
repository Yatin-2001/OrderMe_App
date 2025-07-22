const express = require('express');
const router = express.Router();
const { createOrder, cancelOrder } = require('../controllers/orderControllers');

router.post('/create', createOrder);
router.post('/cancel/:orderId', cancelOrder);
router.post('/confirm-return', confirmReturn);

module.exports = router;