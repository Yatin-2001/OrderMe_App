const express = require('express');
const router = express.Router();
const { getShipmentStatus, deliveredShipment, pickedOrder } = require('../controllers/shipmentController');

router.get('/:orderId', getShipmentStatus);
router.put('/delivered', deliveredShipment);
router.put('/pickedup', pickedOrder);

module.exports = router;
