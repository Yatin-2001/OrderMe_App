// kafka/consumers.js
const { kafka } = require('../config/kafka');
const { processPayment, processCODPayment, processRefund } = require('../controller/paymentController');

const consumer = kafka.consumer({ groupId: 'payment-service' });

async function startPaymentConsumers() {
  await consumer.connect();
  await consumer.subscribe({topic: 'update-payment'})
  await consumer.subscribe({ topic: 'COD_PAYMENT_RECEIVED' });
  await consumer.subscribe({ topic: 'pickup-successfull' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      if(topic === 'update-payment') await processPayment(data);
      if (topic === 'COD_PAYMENT_RECEIVED') await processCODPayment(data);
      if (topic === 'pickup-successfull') await processRefund(data); // Will happen after pickup...
    }
  });
}

module.exports = { startPaymentConsumers };
