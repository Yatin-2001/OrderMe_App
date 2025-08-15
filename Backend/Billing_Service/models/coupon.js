import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  description: String,
  discountType: { type: String, enum: ["PERCENT", "FLAT", "BOGO", "FREE_DELIVERY"] },
  value: Number, // for percent/flat
  bogoDetails: {
    buyProductId: String,
    getProductId: String,
    getQuantity: Number,
  },
  scope: { type: String, enum: ["GLOBAL", "ITEM_SPECIFIC", "CATEGORY"], default: "GLOBAL" },
  targetProductId: String, // for ITEM_SPECIFIC
  minCartValue: Number,
  category: String, // for future extensibility
  expiry: Date,
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("Coupon", couponSchema);
