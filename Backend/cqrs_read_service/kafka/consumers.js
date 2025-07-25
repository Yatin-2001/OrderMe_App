const { Kafka } = require('kafkajs');
const { addOrder, updateOrder, addPayment, updatePayment, addShipment, updateShipment, addProduct, updateProduct, deleteProduct } = require('../controllers/cqrsControllers');

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'cqrs-service-group' });

async function startOrderConsumers() {
    await consumer.connect();
  
    await consumer.subscribe({ topic: 'add-order', fromBeginning: false });
    await consumer.subscribe({ topic: 'add-payment', fromBeginning: false });
    await consumer.subscribe({ topic: 'add-shipment', fromBeginning: false });


    await consumer.subscribe({ topic: 'add-product', fromBeginning: false });
    await consumer.subscribe({ topic: 'update-product', fromBeginning: false });
    await consumer.subscribe({ topic: 'delete-product', fromBeginning: false });

    await consumer.subscribe({ topic: 'update-order', fromBeginning: false });
    await consumer.subscribe({ topic: 'update-payment', fromBeginning: false });
    await consumer.subscribe({ topic: 'update-shipment', fromBeginning: false });
  
    consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value.toString());
  
        if(topic === 'add-order')

        
        await order.save();
        console.log(`Order ${data.orderId} updated to ${order.status}`);
      },
    });
  }
  
  module.exports = { startOrderConsumers };