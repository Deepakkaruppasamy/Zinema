import express from 'express';
import { createTicket, getFaqs, listMyTickets, getTicket, adminUpdateTicket, adminListTickets } from '../controllers/supportController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint: customers can submit without auth
router.post('/ticket', createTicket);
// Public FAQs
router.get('/faqs', getFaqs);
// Authed: list my tickets
router.get('/my', listMyTickets);
// Admin: list all tickets
router.get('/', protectAdmin, adminListTickets);
// Authed or admin: get a ticket by id (authorization enforced in controller)
router.get('/:id', getTicket);
// Admin: update ticket status/notes
router.patch('/:id', protectAdmin, adminUpdateTicket);

export default router;
