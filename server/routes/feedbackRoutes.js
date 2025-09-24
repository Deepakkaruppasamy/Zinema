import express from 'express'
import { createFeedback, listFeedback } from '../controllers/feedbackController.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public: allow customers to submit feedback (auth optional)
router.post('/', createFeedback)

// Admin only: list feedback
router.get('/', protectAdmin, listFeedback)

export default router


