import Feedback from '../models/Feedback.js'

// POST /api/feedback
export const createFeedback = async (req, res) => {
  try {
    const { name = 'Guest', email = '', subject = 'Quick Feedback', message = '', rating = 0, meta = {} } = req.body || {}
    if (!String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const fb = await Feedback.create({
      userId: req.auth ? req.auth.userId : undefined,
      name,
      email,
      subject,
      message,
      rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
      meta
    })
    return res.json({ success: true, feedback: fb })
  } catch (e) {
    console.error('createFeedback error', e)
    return res.status(500).json({ success: false, message: 'Failed to submit feedback' })
  }
}

// GET /api/feedback (admin)
export const listFeedback = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      Feedback.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments({})
    ])
    return res.json({ success: true, items, total, page, limit })
  } catch (e) {
    console.error('listFeedback error', e)
    return res.status(500).json({ success: false, message: 'Failed to list feedback' })
  }
}


