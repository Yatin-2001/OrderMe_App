// order-service/utils/refundWatcher.js
const Order = require('../models/order');
const { kafkaProducer } = require('../kafka/producer');

async function refundWatcher() {

  setInterval(async () => {
    try {
      const pendingRefunds = await Order.find({
        status: 'CANCELLED',
        isRefundInitiated: false
      });

      for (const order of pendingRefunds) {
        const payload = {
          orderId: order._id,
          userId: order.userId,
          amount: order.amount,
          reason: 'Refund due to cancelled order'
        };

        await kafkaProducer.send({
          topic: 'initiate_refund_for_cancelled_order',
          messages: [{ key: order._id.toString(), value: JSON.stringify(payload) }],
        });

        // Mark as refund initiated to prevent re-processing
        order.isRefundInitiated = true;
        order.status = 'REFUND INITIATED';
        await order.save();

        console.log(`✅ Refund initiated for Order ID: ${order._id}`);

      }
    } catch (error) {
      console.error('❌ Error in refundWatcher:', error.message);

    }

  }, process.env.REFUND_WATCHER_TIMER*1000); // Check every 10 seconds (tune this as per load)
}

module.exports = refundWatcher;
