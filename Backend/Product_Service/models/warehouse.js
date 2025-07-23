const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: String,
  address: String,
  pincode: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
