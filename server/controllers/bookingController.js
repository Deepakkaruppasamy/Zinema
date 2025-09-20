import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Coupon from "../models/Coupon.js";
import Show from "../models/Show.js"
import User from "../models/User.js"
import { updateBookingStats } from "./gamificationController.js";

import stripe from 'stripe'


// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats, couponCode} = req.body;
        const { origin } = req.headers;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Apply loyalty tier discount
        const userDoc = await User.findById(userId).lean();
        const tier = userDoc?.tier || 'BRONZE';
        const discounts = { BRONZE: 0, SILVER: 0.05, GOLD: 0.1, PLATINUM: 0.15 };
        const baseAmount = showData.showPrice * selectedSeats.length;
        const loyaltyDiscountPct = discounts[tier] || 0;
        let provisionalAmount = Math.max(0, baseAmount - baseAmount * loyaltyDiscountPct);

        // Optional coupon
        let appliedCouponCode = null
        let couponDiscountAmount = 0
        if (couponCode) {
            const code = String(couponCode).toUpperCase().trim()
            const now = new Date()
            const coup = await Coupon.findOne({ code, active: true })
            const inWindow = coup && (!coup.validFrom || coup.validFrom <= now) && (!coup.validUntil || now <= coup.validUntil)
            if (coup && inWindow && provisionalAmount >= (coup.minAmount || 0)) {
                if (coup.type === 'percent') couponDiscountAmount = Math.max(0, provisionalAmount * (coup.value/100))
                else if (coup.type === 'flat') couponDiscountAmount = Math.min(provisionalAmount, coup.value)
                appliedCouponCode = code
            }
        }
        const finalAmount = Math.max(0, provisionalAmount - couponDiscountAmount);

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: finalAmount,
            couponCode: appliedCouponCode || undefined,
            discountAmount: Math.round(couponDiscountAmount),
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        // Update gamification stats immediately when booking is created
        try {
            const { updateBookingStats } = await import('./gamificationController.js');
            await updateBookingStats(userId, finalAmount, selectedSeats.length > 1, false); // false = initial booking
            console.log('Gamification stats updated for booking:', booking._id);
        } catch (error) {
            console.error('Error updating gamification stats:', error);
            // Don't fail the booking for gamification errors
        }

        // Update admin analytics immediately
        try {
            // Log booking creation for admin tracking
            console.log('Booking created for admin tracking:', {
                bookingId: booking._id,
                userId: userId,
                amount: finalAmount,
                seats: selectedSeats.length,
                movie: showData.movie.title,
                showTime: showData.showDateTime,
                isPaid: false
            });
            
            // The admin dashboard will automatically pick up this data when it refreshes
            // No additional action needed as the booking is already in the database
        } catch (error) {
            console.error('Error updating admin data:', error);
            // Don't fail the booking for admin errors
        }

         // Stripe Gateway Initialize
         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         // Creating line items to for Stripe
         const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
         })

         booking.paymentLink = session.url
         await booking.save()

         // Run Inngest Sheduler Function to check payment status after 10 minutes
         await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
         })

         res.json({success: true, url: session.url, amount: booking.amount, couponCode: booking.couponCode, discountAmount: booking.discountAmount})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getOccupiedSeats = async (req, res)=>{
    try {
        
        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success: true, occupiedSeats})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}