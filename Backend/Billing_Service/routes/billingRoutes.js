import express from "express";
import {
  getApplicableCoupons,
  generateBill,
  getBillById,
  getBestCouponCombo
} from "../controllers/billingControllers.js";

const router = express.Router();

router.post("/coupon/applicable", getApplicableCoupons);
router.post("/generate", generateBill);
router.get("/:billId", getBillById);
router.post("/coupon/best-combo", getBestCouponCombo);

export default router;
