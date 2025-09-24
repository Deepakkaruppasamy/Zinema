import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    tickets: { type: Number, default: 1 },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['registered', 'paid', 'cancelled'], default: 'registered' }
  },
  { timestamps: true }
);

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

export default EventRegistration;


