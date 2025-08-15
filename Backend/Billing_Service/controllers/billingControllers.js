import Bill from "../models/bill.js";
import Coupon from "../models/coupon.js";


// 1. Get applicable coupons based on cart
export const getApplicableCoupons = async (req, res) => {
  const { cartItems, cartTotal } = req.body;
  const activeCoupons = await Coupon.find({ isActive: true, expiry: { $gt: new Date() } });

  const applicable = activeCoupons.filter(coupon => {
    if (coupon.scope === "GLOBAL" && (!coupon.minCartValue || cartTotal >= coupon.minCartValue)) {
      return true;
    }
    if (coupon.scope === "ITEM_SPECIFIC") {
       return cartItems.some(item => item.productId === coupon.targetProductId);
    }
    return false;
  });

  res.json({ coupons: applicable });
};


// 2. Generate bill after applying selected coupons
export const generateBill = async (req, res) => {
  const { userEmail, cartItems, selectedCoupons } = req.body;

  const coupons = await Coupon.find({ code: { $in: selectedCoupons }, isActive: true });

  let subtotal = 0;
  let totalDiscount = 0;
  const productDetails = [];
  const globalDiscounts = [];

  for (const item of cartItems) {
    let total = item.quantity * item.price;
    let itemDiscounts = [];

    for (const coupon of coupons) {
      if (coupon.scope === "ITEM_SPECIFIC" && coupon.targetProductId === item.productId) {
        if (coupon.discountType === "PERCENT") {
          const d = (coupon.value / 100) * total;
          total -= d;
          totalDiscount += d;
          itemDiscounts.push({ code: coupon.code, discountAmount: d });

        } else if (coupon.discountType === "FLAT") {
          total -= coupon.value;
          totalDiscount += coupon.value;
          itemDiscounts.push({ code: coupon.code, discountAmount: coupon.value });

        } else if (coupon.discountType === "BOGO") {
          const freeQty = Math.floor(item.quantity / 2) * coupon.bogoDetails.getQuantity;
          const d = freeQty * item.price;
          totalDiscount += d;
          itemDiscounts.push({ code: coupon.code, discountAmount: d });

        }
      }
    }

    subtotal += total;
    productDetails.push({ ...item, total, appliedDiscounts: itemDiscounts });
  }

  // Apply global discounts
  for (const coupon of coupons) {
    if (coupon.scope === "GLOBAL" && (!coupon.minCartValue || subtotal >= coupon.minCartValue)) {
      if (coupon.discountType === "PERCENT") {
        const d = (coupon.value / 100) * subtotal;
        subtotal -= d;
        totalDiscount += d;
        globalDiscounts.push({ code: coupon.code, discountAmount: d });

      } else if (coupon.discountType === "FLAT") {
        subtotal -= coupon.value;
        totalDiscount += coupon.value;
        globalDiscounts.push({ code: coupon.code, discountAmount: coupon.value });

      } else if (coupon.discountType === "FREE_DELIVERY") {
        globalDiscounts.push({ code: coupon.code, discountAmount: 0 });

      }
    }
  }

  const deliveryCharge = coupons.some(c => c.discountType === "FREE_DELIVERY") ? 0 : 50;
  const totalPayable = subtotal + deliveryCharge;

  const bill = new Bill({
    orderId,
    userEmail,
    products: productDetails,
    globalDiscounts,
    subtotal,
    totalDiscount,
    deliveryCharge,
    totalPayable,
    appliedCoupons: selectedCoupons
  });

  await bill.save();
  res.json({billId: bill._id});
};


// 3. Fetch bill by Id
export const getBillById = async (req, res) => {
  const bill = await Bill.findOne({ _id: req.params.billId });
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  res.json(bill);
};



// 4. Apply best coupon combo to maximze savings;
export const getBestCouponCombo = async (req, res) => {
  const { cartItems, cartTotal } = req.body;

  const coupons = await Coupon.find({ isActive: true, expiry: { $gt: new Date() } });

  // Step 1: Filter only applicable coupons
  const applicableCoupons = coupons.filter(coupon => {
    if (coupon.scope === "GLOBAL") {
      return !coupon.minCartValue || cartTotal >= coupon.minCartValue;
    }
    if (coupon.scope === "ITEM_SPECIFIC") {
      return cartItems.some(item => item.productId === coupon.targetProductId);
    }
    return false;
  });

  // Helper to calculate discount from a coupon set
  const calculateTotalDiscount = (selectedCoupons) => {
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of cartItems) {
      let total = item.quantity * item.price;

      for (const coupon of selectedCoupons) {
        if (coupon.scope === "ITEM_SPECIFIC" && coupon.targetProductId === item.productId) {
          if (coupon.discountType === "PERCENT") {
            const d = (coupon.value / 100) * total;
            total -= d;
            totalDiscount += d;
          } else if (coupon.discountType === "FLAT") {
            total -= coupon.value;
            totalDiscount += coupon.value;
          } else if (coupon.discountType === "BOGO") {
            const freeQty = Math.floor(item.quantity / 2) * coupon.bogoDetails.getQuantity;
            const d = freeQty * item.price;
            totalDiscount += d;
          }
        }
      }
      subtotal += total;
    }

    for (const coupon of selectedCoupons) {
      if (coupon.scope === "GLOBAL" && (!coupon.minCartValue || subtotal >= coupon.minCartValue)) {
        if (coupon.discountType === "PERCENT") {
          const d = (coupon.value / 100) * subtotal;
          subtotal -= d;
          totalDiscount += d;
        } else if (coupon.discountType === "FLAT") {
          subtotal -= coupon.value;
          totalDiscount += coupon.value;
        }
      }
    }

    return totalDiscount;
  };

  // Step 2: Try all non-empty subsets (powerset - empty) of applicable coupons
  const powerSet = (arr) =>
    arr.reduce((subsets, value) => subsets.concat(subsets.map(set => [...set, value])), []).slice(1);

  const allCombos = powerSet(applicableCoupons);

  let bestCombo = [];
  let maxDiscount = 0;

  for (const combo of allCombos) {
    const discount = calculateTotalDiscount(combo);
    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestCombo = combo.map(c => c.code);
    }
  }

  return res.json({
    bestCoupons: bestCombo,
    totalDiscount: maxDiscount
  });
};
