import mongoose from 'mongoose'

const supportTicketSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  name: { type: String },
  email: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['general', 'payment', 'booking', 'refund', 'technical'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  adminNotes: { type: String, default: '' },
  attachments: [{ name: String, url: String }]
}, { timestamps: true })

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema)
export default SupportTicket
