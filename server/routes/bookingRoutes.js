import express from 'express';
import { createBooking, getOccupiedSeats, getBookingIcs } from '../controllers/bookingController.js';

const bookingRouter = express.Router();


bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.get('/:id/ics', getBookingIcs);

export default bookingRouter;