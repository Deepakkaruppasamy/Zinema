import EventRegistration from '../models/EventRegistration.js';

export const createRegistration = async (req, res) => {
  try {
    const reg = await EventRegistration.create(req.body)
    res.status(201).json({ success: true, registration: reg })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const listRegistrations = async (req, res) => {
  try {
    const { event } = req.query
    const filter = {}
    if (event) filter.event = event
    const regs = await EventRegistration.find(filter).sort({ createdAt: -1 }).populate('event')
    res.json({ success: true, registrations: regs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getRegistration = async (req, res) => {
  try {
    const reg = await EventRegistration.findById(req.params.id).populate('event')
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' })
    res.json({ success: true, registration: reg })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateRegistration = async (req, res) => {
  try {
    const reg = await EventRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' })
    res.json({ success: true, registration: reg })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteRegistration = async (req, res) => {
  try {
    const reg = await EventRegistration.findByIdAndDelete(req.params.id)
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


