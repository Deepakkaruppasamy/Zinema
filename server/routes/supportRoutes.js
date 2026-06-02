import express from 'express';
import { createTicket, getFaqs, listMyTickets, getTicket, adminUpdateTicket, adminListTickets } from '../controllers/supportController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/ticket', createTicket);
router.get('/faqs', getFaqs);
router.get('/my', listMyTickets);
router.get('/', protectAdmin, adminListTickets);
router.get('/:id', getTicket);
router.patch('/:id', protectAdmin, adminUpdateTicket);

export default router;
