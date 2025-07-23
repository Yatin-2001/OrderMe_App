const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  address: String,
  status: {
    type: String,
    enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'COD']
  },
  scheduledDay: {
    type: Date,
  },
  warehouse: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
