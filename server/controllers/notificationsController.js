import Reminder from '../models/Reminder.js'
import Show from '../models/Show.js'
import sendEmail from '../configs/nodeMailer.js'

export const addReminder = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { showId, channel, minutesBefore, sendAt } = req.body
    if (!showId) return res.json({ success: false, message: 'showId is required' })

    const show = await Show.findById(showId)
    if (!show) return res.json({ success: false, message: 'Show not found' })

    let when = sendAt ? new Date(sendAt) : null
    if (!when) {
      const mins = Number(minutesBefore ?? 30)
      when = new Date(new Date(show.showDateTime).getTime() - mins * 60000)
    }

    const doc = await Reminder.findOneAndUpdate(
      { user: userId, show: showId },
      { user: userId, show: showId, channel: channel || 'email', sendAt: when },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    // For now, if it's in the past or within 2 minutes, send immediately via email channel
    if (doc.channel === 'email') {
      const now = new Date()
      if (!doc.sendAt || doc.sendAt <= new Date(now.getTime() + 2*60000)) {
        try {
          await sendEmail({
            to: req.auth()?.claims?.email || process.env.SMTP_USER,
            subject: 'Zinema Reminder',
            html: `<p>Your show reminder is set for ${new Date(show.showDateTime).toLocaleString()}.</p>`
          })
        } catch (e) {
          // ignore send failures here
        }
      }
    }

    res.json({ success: true, reminder: doc })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const myReminders = async (req, res) => {
  try {
    const { userId } = req.auth()
    const items = await Reminder.find({ user: userId }).populate('show')
    res.json({ success: true, reminders: items })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}
