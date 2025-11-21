
import { deepaiChat, deepaiAssistant, checkAIServiceHealth } from '../controllers/deepaiController.js'

const router = Router()
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Add error handling middleware for DeepAI routes
router.use((req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      status: 'service_unavailable',
      message: 'DeepAI service is not properly configured. Please check server logs.'
    })
  }
  next()
})

router.post('/chat', deepaiChat)
router.post('/assistant', deepaiAssistant)

export default router


