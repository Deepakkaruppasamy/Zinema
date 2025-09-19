import Waitlist from '../models/Waitlist.js'

export const addToWaitlist = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { showId } = req.body
    if (!showId) return res.json({ success: false, message: 'showId is required' })
    await Waitlist.create({ user: userId, show: showId })
    return res.json({ success: true })
  } catch (e) {
    if (e.code === 11000) return res.json({ success: true, message: 'Already in waitlist' })
    return res.json({ success: false, message: e.message })
  }
}

export const myWaitlists = async (req, res) => {
  try {
    const { userId } = req.auth()
    const list = await Waitlist.find({ user: userId }).populate('show')
    return res.json({ success: true, list })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
}
