// kafka/consumers.js
const { kafka } = require('../config/kafka');
const { handleShipment } = require('../controllers/shipmentController');

const consumer = kafka.consumer({ groupId: 'shipment-service' });

async function startShipmentConsumers() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'shipment-initiate' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      if (topic === 'shipment-initiate') await handleShipment(data);
    }
  });
}

module.exports = { startShipmentConsumers };
