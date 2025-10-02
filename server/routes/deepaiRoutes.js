import { Router } from 'express'
import { deepaiChat, deepaiAssistant } from '../controllers/deepaiController.js'

const router = Router()

// Health check endpoint for DeepAI service
router.get('/health', (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  
  res.json({
    status: hasApiKey ? 'configured' : 'missing_api_key',
    hasApiKey,
    modelName,
    message: hasApiKey 
      ? 'DeepAI service is properly configured' 
      : 'GEMINI_API_KEY environment variable is not set'
  })
})

router.post('/chat', deepaiChat)
router.post('/assistant', deepaiAssistant)

export default router


