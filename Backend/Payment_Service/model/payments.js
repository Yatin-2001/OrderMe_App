const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  amount: Number,
  status: {
    type: String,
    enum: ['INITIATED', 'SUCCESS', 'FAILED'],
    default: 'INITIATED'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'COD']
  },
  isCODPayed : {
    type: Boolean,
  }

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
