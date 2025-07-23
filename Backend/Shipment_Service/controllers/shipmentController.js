const Shipment = require('../models/Shipment');
const { sendEvent } = require('../kafka/producer');

var getShipmentStatus = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ orderId: req.params.orderId });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    res.json(shipment);

  } catch (err) {
    res.status(500).json({ error: err.message });

  }
};

async function handleShipment(data){



}

async function deliveredShipment({ orderId, paymentMethod }) {
    console.log(`Shipment completed for order ${orderId}`);
  
    // Emit delivery event
    await sendEvent('ORDER_DELIVERED', { orderId });
  
    if (paymentMethod === 'COD') {
      // Simulate cash received at delivery
      await sendEvent('COD_PAYMENT_RECEIVED', { orderId });
    }
}

module.exports = { getShipmentStatus, handleShipment, deliveredShipment }
