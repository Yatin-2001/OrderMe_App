// controllers/orderController.js
const Order = require('../models/Order');
const { sendEvent } = require('../kafka/producer');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, address } = req.body;
    const userId = req.user.id;

    // 1. Create order in DB
    const order = await Order.create({ userId, items, totalAmount, userAddress: address });

    // 2. Initiate SAGA for Reserve Inventory
    await sendEvent('reserve-inventory', {
      orderId: order._id,
      userId: userId,
      amount: totalAmount,
      paymentMethod: paymentMethod,
      address: address,
      items,
    });


    res.status(201).json({ message: 'Order placed. Reservation started.', orderId: order._id });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Order creation failed.' });

  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    if (['CANCELLED', 'FAILED'].includes(order.status))
      return res.status(400).json({ error: 'Order already cancelled or failed' });


    // Common flow ...
    await sendEvent('cancel-order', {
      orderId,
      items: order.items,
      status: order.status,
      warehouseId: order.warehouseSelected,
      reason: 'Delivery cancellation',
    });

    order.status = 'CANCELLED';
    await order.save();

    return res.json({ message: 'Order Cancellation in progress...' });

  } catch (err) {
    console.error('Cancel Order error:', err);
    res.status(500).json({ error: 'Internal error while cancelling order' });
  }
};
