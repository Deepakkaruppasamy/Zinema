import mongoose from "mongoose";

const paymentLinkSchema = new mongoose.Schema({
  show: { type: String, ref: "Show", required: true },
  seats: { type: [String], required: true },
  createdBy: { type: String, ref: "User", required: true },
  status: { type: String, enum: ["active", "used", "expired"], default: "active" },
  expiresAt: { type: Date, required: true },
  stripeSessionId: { type: String },
}, { timestamps: true });

const PaymentLink = mongoose.model("PaymentLink", paymentLinkSchema);
export default PaymentLink;
