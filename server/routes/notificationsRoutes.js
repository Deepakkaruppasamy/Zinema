import express from 'express'
import { addReminder, myReminders } from '../controllers/notificationsController.js'

const router = express.Router()

router.post('/reminder', addReminder)
router.get('/my', myReminders)

export default router
