import express from 'express'
import { createFeedback, listFeedback } from '../controllers/feedbackController.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', createFeedback)

router.get('/', protectAdmin, listFeedback)

export default router


