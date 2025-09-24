import mongoose from 'mongoose';

const ConcessionItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['popcorn', 'drink', 'snack', 'combo', 'other'], default: 'other' },
    isActive: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        values: [
          {
            value: { type: String, required: true },
            priceDelta: { type: Number, default: 0 },
          },
        ],
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ConcessionItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('ConcessionItem', ConcessionItemSchema);


