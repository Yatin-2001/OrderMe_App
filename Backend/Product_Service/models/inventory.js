const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  reserved: { type: Number, default: 0 } // Tracks reserved but not deducted stock
});

inventorySchema.index({ warehouseId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
