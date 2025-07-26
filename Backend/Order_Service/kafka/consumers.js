const { Kafka } = require('kafkajs');
const Order = require('../models/Order');

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'order-service-group' });

const { sendEvent } = require('./producer');

async function handleFailure(order) {
  // Emit compensation event in case of any failure.
  await sendEvent('cancel-order', {
    orderId: order._id,
    items: order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  });

  order.status = 'FAILED';
}


async function startOrderConsumers() {
  await consumer.connect();

  await consumer.subscribe({ topic: 'inventory-reserved', fromBeginning: false });
  await consumer.subscribe({ topic: 'inventory-failed', fromBeginning: false });

  await consumer.subscribe({ topic: 'payment-success', fromBeginning: false });
  await consumer.subscribe({ topic: 'payment-failed', fromBeginning: false });

  await consumer.subscribe({ topic: 'shipment-created', fromBeginning: false });
  await consumer.subscribe({ topic: 'shipment-delivered', fromBeginning: false });
  await consumer.subscribe({ topic: 'shipment-failed', fromBeginning: false });

  await consumer.subscribe({ topic: 'pickup-scheduled', fromBeginning: false });
  await consumer.subscribe({ topic: 'pickup-successful', fromBeginning: false });
  await consumer.subscribe({ topic: 'pickup-failed', fromBeginning: false });

  await consumer.subscribe({ topic: 'refund-success', fromBeginning: false });
  await consumer.subscribe({ topic: 'refund-failed', fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      const order = await Order.findById(data.orderId);

      if (!order) return;

      switch (topic) {
        case 'inventory-reserved':
          order.status = 'INVENTORY_RESERVED';
          order.warehouseSelected = data.warehouseId;
          break;
        case 'inventory-failed':
          handleFailure(order);
          break;
        case 'payment-success':
          order.status = 'PAYMENT_SUCCESS';
          break;
        case 'payment-failed':
          handleFailure(order);
          break;
        case 'shipment-created':
          order.status = 'SHIPPED';
          break;
        case 'shipment-delivered':
          order.status = 'DELIVERED';
          break;
        case 'shipment-failed':
          handleFailure(order);
          break;
        case 'pickup-scheduled':
          order.status = 'PICKUP SCHEDULED'
          break;
        case 'pickup-successful':
          order.status = 'PICKUP SUCCESSFUL'
          break;
        case 'pickup-failed':
          handleFailure(order);
          break;
        case 'refund-success':
          order.isRefundPaid = true;
          order.status = 'REFUND INITIATED'
          break;
        case 'refund-failed':
          // Handled separately by a async service that will handle all the cancelled but refund not paid Orders.
          order.isRefundPaid = false;
          break;
        default:
          break;
      }

      await order.save();

      // Initate Event for creating order.
      await sendEvent('update-order', {
        orderId: order._id,
        status: order.status
      });

      console.log(`Order ${data.orderId} updated to ${order.status}`);
    },
  });
}

module.exports = { startOrderConsumers };
