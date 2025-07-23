// kafka/consumers.js
const { kafka } = require('../config/kafka');
const { handleShipment, cancelShipment } = require('../controllers/shipmentController');

const consumer = kafka.consumer({ groupId: 'shipment-service' });

async function startShipmentConsumers() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'shipment-initiate' });
  await consumer.subscribe({ topic: 'cancel-order' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      if (topic === 'shipment-initiate') await handleShipment(data);
      if (topic === 'cancel-order') await cancelShipment(data);
    }
  });
}

module.exports = { startShipmentConsumers };
