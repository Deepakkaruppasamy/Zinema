import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  value: { type: Number, required: true }, // percent: 5..100, flat: cents or currency unit
  active: { type: Boolean, default: true },
  minAmount: { type: Number, default: 0 },
  validFrom: { type: Date },
  validUntil: { type: Date },
  allowedPaymentMethods: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
})

const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon
