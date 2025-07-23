const { Kafka } = require('kafkajs');
const Product = require('../models/Product');
const { reserveInventory, releaseInventory } = require('../controllers/productControllers');

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
const consumer = kafka.consumer({ groupId: 'product-service-group' });

async function startProductConsumers() {
  await consumer.connect();

  await consumer.subscribe({ topic: 'reserve-inventory', fromBeginning: false });
  await consumer.subscribe({ topic: 'cancel-order', fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());

      if (topic === 'reserve-inventory') {
        await reserveInventory(data);
      }

      if (topic === 'cancel-order') {
        await releaseInventory(data);
      }
    },
  });
}

module.exports = { startProductConsumers };
