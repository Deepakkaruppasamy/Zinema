import express from 'express';
import { createPaymentLink, checkoutPaymentLink, createConcessionPaymentIntent } from '../controllers/paymentLinkController.js';

const router = express.Router();

// Create a shareable payment link and lock seats
router.post('/', createPaymentLink);

// Consume a link: create booking for current user and return Stripe checkout URL
router.post('/:id/checkout', checkoutPaymentLink);

// Concessions: create PaymentIntent and return client secret
router.post('/concessions/payment-intent', createConcessionPaymentIntent);

export default router;
