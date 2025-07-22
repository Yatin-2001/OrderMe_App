const { Kafka } = require('kafkajs');
const Product = require('../models/Product');

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
        let canReserve = true;

        for (const item of data.items) {
          const product = await Product.findById(item.productId);
          if (!product || product.quantity < item.quantity) {
            canReserve = false;
            break;
          }
        }

        if (canReserve) {
          for (const item of data.items) {
            const product = await Product.findById(item.productId);
            product.quantity -= item.quantity;
            await product.save();
          }

          await sendEvent('inventory-reserved', { orderId: data.orderId });
        } else {
          await sendEvent('inventory-failed', { orderId: data.orderId });
        }
      }

      if (topic === 'cancel-order') {
        for (const item of data.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.quantity += item.quantity;
            await product.save();
          }
        }
        console.log(`Inventory released for order ${data.orderId}`);
      }
    },
  });
}

module.exports = { startProductConsumers };
