const express = require('express');
const router = express.Router();
const { getShipmentStatus } = require('../controllers/shipmentController');

router.get('/:orderId', getShipmentStatus);

module.exports = router;
