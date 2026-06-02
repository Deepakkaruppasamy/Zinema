import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Coupon from "../models/Coupon.js";
import Show from "../models/Show.js"
import User from "../models/User.js"
import { updateBookingStats } from "./gamificationController.js";

import stripe from 'stripe'
import { buildICS } from '../utils/ics.js'


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
        const {showId, selectedSeats, couponCode, greenTicketingDonation = false} = req.body;
        const { origin } = req.headers;

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        const showData = await Show.findById(showId).populate('movie');

        const userDoc = await User.findById(userId).lean();
        const tier = userDoc?.tier || 'BRONZE';
        const discounts = { BRONZE: 0, SILVER: 0.05, GOLD: 0.1, PLATINUM: 0.15 };
        const baseAmount = showData.showPrice * selectedSeats.length;
        const loyaltyDiscountPct = discounts[tier] || 0;
        let provisionalAmount = Math.max(0, baseAmount - baseAmount * loyaltyDiscountPct);

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
        
        const greenDonationAmount = greenTicketingDonation ? selectedSeats.length : 0;
        const finalAmount = Math.max(0, provisionalAmount - couponDiscountAmount + greenDonationAmount);

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: finalAmount,
            couponCode: appliedCouponCode || undefined,
            discountAmount: Math.round(couponDiscountAmount),
            bookedSeats: selectedSeats,
            greenTicketingDonation: greenDonationAmount
        })

        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        try {
            const { updateBookingStats } = await import('./gamificationController.js');
            await updateBookingStats(userId, finalAmount, selectedSeats.length > 1, false);
            console.log('Gamification stats updated for booking:', booking._id);
        } catch (error) {
            console.error('Error updating gamification stats:', error);
        }

        try {
            console.log('Booking created for admin tracking:', {
                bookingId: booking._id,
                userId: userId,
                amount: finalAmount,
                seats: selectedSeats.length,
                movie: showData.movie.title,
                showTime: showData.showDateTime,
                isPaid: false
            });
            
        } catch (error) {
            console.error('Error updating admin data:', error);
        }

         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount - greenDonationAmount) * 100
            },
            quantity: 1
         }]

         if (greenDonationAmount > 0) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `🌱 Carbon Neutral Donation (${selectedSeats.length} ticket${selectedSeats.length > 1 ? 's' : ''})`
                    },
                    unit_amount: greenDonationAmount * 100
                },
                quantity: 1
            });
         }

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
         })

         booking.paymentLink = session.url
         await booking.save()

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

export const getBookingIcs = async (req, res) => {
    try {
        const bookingId = req.params.id
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie', model: 'Movie' }
        })
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

        const start = new Date(booking.show.showDateTime)
        const ics = buildICS({
            title: booking.show.movie.title,
            description: `Seats: ${booking.bookedSeats.join(', ')} | Order: ${booking._id}`,
            start,
            end: new Date(start.getTime() + 2 * 60 * 60 * 1000),
            location: 'Cinema',
            organizer: process.env.SENDER_EMAIL || 'noreply@zinema.app',
            url: `${req.headers.origin || ''}/ticket/${booking._id}`
        })
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="${String(booking._id)}.ics"`)
        return res.send(ics)
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to generate ICS' })
    }
}