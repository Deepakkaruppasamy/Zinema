import Poll from '../models/Poll.js'

export const vote = async (req, res) => {
  try {
    const { key, option, title } = req.body
    if (!key || !option) return res.json({ success: false, message: 'key and option are required' })
    const pollKey = String(key).toLowerCase().trim()
    const optName = String(option).trim()

    const poll = await Poll.findOne({ key: pollKey })
    if (!poll) {
      const created = await Poll.create({ key: pollKey, title: title || key, options: [{ name: optName, count: 1 }], createdBy: req.auth?.().userId })
      return res.json({ success: true, poll: created })
    } else {
      const idx = (poll.options || []).findIndex(o => o.name.toLowerCase() === optName.toLowerCase())
      if (idx >= 0) poll.options[idx].count += 1
      else poll.options.push({ name: optName, count: 1 })
      await poll.save()
      return res.json({ success: true, poll })
    }
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const getResults = async (req, res) => {
  try {
    const { key } = req.params
    const pollKey = String(key).toLowerCase().trim()
    const poll = await Poll.findOne({ key: pollKey }).lean()
    if (!poll) return res.json({ success: true, poll: { key: pollKey, title: key, options: [] }})
    const options = (poll.options || []).slice().sort((a,b)=> (b.count||0)-(a.count||0))
    res.json({ success: true, poll: { ...poll, options } })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}
