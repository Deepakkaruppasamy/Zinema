import mongoose from 'mongoose'

const waitlistSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  createdAt: { type: Date, default: Date.now }
})

waitlistSchema.index({ user: 1, show: 1 }, { unique: true })

const Waitlist = mongoose.model('Waitlist', waitlistSchema)
export default Waitlist
