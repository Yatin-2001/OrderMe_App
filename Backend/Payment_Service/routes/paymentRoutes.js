const express = require('express');
const router = express.Router();
const { getPaymentByOrderId } = require('../controller/paymentController');

router.get('/:orderId', getPaymentByOrderId);

module.exports = router;
