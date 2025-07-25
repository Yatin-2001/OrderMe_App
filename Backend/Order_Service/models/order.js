// models/Order.js
const mongoose = require('mongoose');

const address = new mongoose.Schema({
  name: String,
  address: String,
  pincode: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: {type: String, requid: true},
  items: [
    {
      productId: String,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['CREATED', 'RESERVED', 'PAID', 'SHIPPED', 'PICKUP SCHEDULED', 'PICKUP SUCCESSFUL','PICKUP FAILED', 'DELIVERED', 'FAILED', 'CANCELLED', 'REFUND INITIATED'],
    default: 'CREATED',
  },
  isRefundPaid: {
    type: Boolean,
    required: false
  },
  userAddress: {
    type: address,
    required: true
  },
  warehouseSelected: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
