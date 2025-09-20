import express from 'express';
import cors from 'cors';
import Booking from '../models/Booking.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debug endpoint to check booking status
app.get('/', (req, res) => {
    res.json({ 
        message: 'Booking Debug API is working!', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /check/:bookingId - Check specific booking status',
            'GET /all - List all bookings with payment status'
        ]
    });
});

// Check specific booking status
app.get('/check/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie' }
        }).populate('user');
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({
            bookingId: booking._id,
            isPaid: booking.isPaid,
            amount: booking.amount,
            paymentLink: booking.paymentLink,
            movieTitle: booking.show?.movie?.title,
            userName: booking.user?.name,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        });
    } catch (error) {
        console.error('Error checking booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List all bookings
app.get('/all', async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            })
            .populate('user')
            .sort({ createdAt: -1 })
            .limit(10);
        
        const bookingList = bookings.map(booking => ({
            bookingId: booking._id,
            isPaid: booking.isPaid,
            amount: booking.amount,
            movieTitle: booking.show?.movie?.title,
            userName: booking.user?.name,
            createdAt: booking.createdAt
        }));
        
        res.json({
            total: bookings.length,
            bookings: bookingList
        });
    } catch (error) {
        console.error('Error listing bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default app;
