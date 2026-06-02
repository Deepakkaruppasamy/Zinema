import express from 'express';
import { createPaymentLink, checkoutPaymentLink, createConcessionPaymentIntent } from '../controllers/paymentLinkController.js';

const router = express.Router();

router.post('/', createPaymentLink);

router.post('/:id/checkout', checkoutPaymentLink);

router.post('/concessions/payment-intent', createConcessionPaymentIntent);

export default router;
