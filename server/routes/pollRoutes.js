import express from 'express'
import { vote, getResults } from '../controllers/pollController.js'

const router = express.Router()

router.post('/vote', vote)
router.get('/:key/results', getResults)

export default router
