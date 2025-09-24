import mongoose from 'mongoose';

const ConcessionOrderItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'ConcessionItem', required: true },
    nameSnapshot: { type: String, required: true },
    imageUrlSnapshot: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    selectedOptions: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        priceDelta: { type: Number, default: 0 },
      },
    ],
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ConcessionOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    items: { type: [ConcessionOrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0, default: 0 },
    taxTotal: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    pickupTime: { type: Date, required: true },
    pickupLocation: { type: String, default: 'Concessions Counter' },
    status: { type: String, enum: ['pending', 'paid', 'preparing', 'ready', 'picked_up', 'cancelled', 'refunded'], default: 'pending' },
    paymentIntentId: { type: String },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ConcessionOrderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('ConcessionOrder', ConcessionOrderSchema);


