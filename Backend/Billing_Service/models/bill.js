import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  userEmail: String,
  products: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
    total: Number,
    appliedDiscounts: [{
      code: String,
      discountAmount: Number
    }]
  }],
  globalDiscounts: [{
    code: String,
    discountAmount: Number
  }],
  subtotal: Number,
  totalDiscount: Number,
  deliveryCharge: Number,
  totalPayable: Number,
  appliedCoupons: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Bill", billSchema);
