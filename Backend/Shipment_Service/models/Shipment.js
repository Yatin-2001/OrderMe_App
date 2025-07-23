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


const shipmentSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  userAddress: address,
  status: {
    type: String,
    enum: ['PENDING', 'CANCELLED', 'SHIPPED', 'DELIVERED', 'FAILED', 'PICKUP SCHEDULED', 'PICKUP SUCCCESSFUL', 'PICKUP FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'COD']
  },
  scheduledDay: {
    type: Date,
    defaukt: Date.now
  },
  warehouseId: {
    type: String,
    required: true
  },
  isPickupRequired:{
    type: Boolean
  },
  pickupSchedule: {
    type: Date,
  }

}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
