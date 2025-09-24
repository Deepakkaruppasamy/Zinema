import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User' },
  name: { type: String, default: 'Guest' },
  email: { type: String, default: '' },
  subject: { type: String, default: 'Quick Feedback' },
  message: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  meta: { type: Object, default: {} }
}, { timestamps: true })

const Feedback = mongoose.model('Feedback', feedbackSchema)
export default Feedback


