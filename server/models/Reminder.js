import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  channel: { type: String, enum: ['email','sms','whatsapp'], default: 'email' },
  sendAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

reminderSchema.index({ user: 1, show: 1 }, { unique: true })

const Reminder = mongoose.model('Reminder', reminderSchema)
export default Reminder
