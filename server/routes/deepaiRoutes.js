import { Router } from 'express'
import { deepaiChat, deepaiAssistant } from '../controllers/deepaiController.js'

const router = Router()

router.post('/chat', deepaiChat)
router.post('/assistant', deepaiAssistant)

export default router


