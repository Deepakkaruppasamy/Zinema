import mongoose from 'mongoose'

const pollOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 0 }
}, { _id: false })

const pollSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String },
  options: [pollOptionSchema],
  createdBy: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

const Poll = mongoose.model('Poll', pollSchema)
export default Poll
