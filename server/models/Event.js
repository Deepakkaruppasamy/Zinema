import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['standup', 'sports', 'concert', 'screening', 'other'], required: true },
    description: { type: String, default: '' },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    dateTime: { type: Date, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    metadata: { type: Object, default: {} },
    createdBy: { type: String, ref: 'User' }
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;


