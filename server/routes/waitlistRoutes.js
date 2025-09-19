import express from 'express'
import { addToWaitlist, myWaitlists } from '../controllers/waitlistController.js'

const router = express.Router()

router.post('/add', addToWaitlist)
router.get('/my', myWaitlists)

export default router
