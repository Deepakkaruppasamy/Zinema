import express from 'express';
import cors from 'cors';
import Booking from '../models/Booking.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Manual booking status update endpoint
app.post('/update-status', async (req, res) => {
    try {
        const { bookingId, isPaid = true } = req.body;
        
        if (!bookingId) {
            return res.status(400).json({ error: 'bookingId is required' });
        }
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId, 
            { 
                isPaid: isPaid,
                paymentLink: isPaid ? "" : booking?.paymentLink // Clear payment link if paid
            }, 
            { new: true }
        ).populate({
            path: 'show',
            populate: { path: 'movie' }
        }).populate('user');
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        console.log('Manually updated booking status:', {
            bookingId: booking._id,
            isPaid: booking.isPaid,
            movieTitle: booking.show?.movie?.title
        });
        
        res.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: {
                id: booking._id,
                isPaid: booking.isPaid,
                amount: booking.amount,
                movieTitle: booking.show?.movie?.title
            }
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking details
app.get('/booking/:bookingId', async (req, res) => {
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
        console.error('Error getting booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Debug endpoint to list all bookings
app.get('/debug-all', async (req, res) => {
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
