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

async function handleShipment(data) {

  try {
    const { orderId, userId, paymentMethod, warehouseId, userAddress } = data;

    var shipment = await Shipment.create({
      orderId,
      userId,
      userAddress,
      paymentMethod: paymentMethod,
      warehouseId,
      status: "PENDING"
    });

    // SAGA to order event for completing the flow.
    await sendEvent('shipment-created', { orderId });

    await sendEvent('add-shipment', {
      orderId: orderId,
      shipmentId: shipment._id,
      scheduledDay: shipment.scheduledDay
    });

    res.json({ msg: "Shipment created successfully!!!" });

  } catch (err) {
    await sendEvent('shipment-failed', { orderId });

    res.status(500).json({ error: `Shipment creation failed!! \nReason: ${err}` });

  }

}

async function deliveredShipment(req, res) {

  const { shipmentId } = req.body;

  var shipment = await Shipment.findById(shipmentId);

  shipment.status = 'DELIVERED';

  shipment.save();

  // Emit delivery event
  await sendEvent('shipment-delivered', { orderId: shipment.orderId });

  await sendEvent('update-shipment', {
    shipmentId: shipment._id,
    status: 'DELIVERED'
  });

  if (paymentMethod === 'COD') {
    // Simulate cash received at delivery
    await sendEvent('COD_PAYMENT_RECEIVED', { orderId: shipment.orderId });
  }
}

async function pickedOrder(req, res) {

  const { shipmentId } = req.body;

  var shipment = await Shipment.findById(shipmentId);

  shipment.status = 'PICKUP SUCCCESSFUL';

  shipment.save();

  // Emit refund initiation event
  await sendEvent('pickup-successful', { orderId: shipment.orderId });

  await sendEvent('update-shipment', {
    shipmentId: shipment._id,
    status: 'PICKUP SUCCCESSFUL'
  });

}

async function cancelShipment(data) {
  try {
    var shipment = Shipment.findOne({ orderId: data.orderId });

    if (shipment.status === 'DELIVERED') {
      // Order pickup will be required;
      shipment.status = 'PICKUP SCHEDULED';

      var schedule = Date.now();

      shipment.isPickupRequired = true;
      shipment.pickupSchedule = schedule

      // SAGA call to Order for pickup schedule...
      await sendEvent('pickup-scheduled', { orderId: shipment.orderId });

      await sendEvent('update-shipment', {
        shipmentId: shipment._id,
        status: 'PICKUP SCHEDULED',
        isPickupRequired: true,
        pickupSchedule: schedule
      });

    } else {
      shipment.status = 'CANCELLED';

      // SAGA call to Payment for refund initiation...
      await sendEvent('pickup-successfull', { orderId: shipment.orderId });

      await sendEvent('update-shipment', {
        shipmentId: shipment._id,
        status: 'CANCELLED'
      });

    }

    shipment.save();


  } catch (err) {
    await sendEvent('pickup-failed', { orderId: shipment.orderId });

  }
}

module.exports = { getShipmentStatus, handleShipment, deliveredShipment, cancelShipment, pickedOrder }
