const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'delivery'], default: 'user' },
  cart: [cartItemSchema]  // Cart functionality
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
