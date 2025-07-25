const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId : {type: String, required: true},
  name: String,
  description: String,
  price: Number,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
