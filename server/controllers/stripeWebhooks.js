import stripe from "stripe";
import Booking from '../models/Booking.js'
import User from '../models/User.js'
import { inngest } from "../inngest/index.js";
import sendEmail from "../configs/nodeMailer.js";
import { buildICS } from "../utils/ics.js";

export const stripeWebhooks = async (request, response)=>{
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    console.log('Stripe webhook received:', request.headers);

    try {
        // Helper to finalize booking: set paid, clear link, award points, and send email
        const finalizeBookingAndNotify = async (bookingId) => {
            if (!bookingId) {
                console.log('No bookingId provided to finalizeBookingAndNotify');
                return;
            }
            console.log('Finalizing booking:', bookingId);
            const booking = await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentLink: ""
            }, { new: true })
            
            console.log('Booking updated:', booking);

            if (booking) {
                const user = await User.findById(booking.user);
                if (user) {
                    const earned = Math.max(1, Math.round((booking.amount || 0) / 10));
                    user.points = (user.points || 0) + earned;
                    const thresholds = [
                        { tier: 'PLATINUM', min: 2000 },
                        { tier: 'GOLD', min: 1000 },
                        { tier: 'SILVER', min: 400 },
                        { tier: 'BRONZE', min: 0 },
                    ];
                    const newTier = thresholds.find(t => user.points >= t.min)?.tier || 'BRONZE';
                    user.tier = newTier;
                    await user.save();
                }
            }

            try {
                const populated = await Booking.findById(bookingId)
                    .populate({
                        path: 'show',
                        populate: { path: 'movie', model: 'Movie' }
                    })
                    .populate('user');

                if (populated && populated.user && populated.show && populated.show.movie) {
                    const start = new Date(populated.show.showDateTime);
                    const ics = buildICS({
                        title: populated.show.movie.title,
                        description: `Your movie booking at Zinema by Dstudio. Seats: ${populated.bookedSeats.join(', ')}`,
                        start,
                        end: new Date(start.getTime() + 2 * 60 * 60 * 1000),
                        location: 'Cinema',
                        organizer: process.env.SENDER_EMAIL,
                    });

                    await sendEmail({
                        to: populated.user.email,
                        subject: `Payment Confirmation: "${populated.show.movie.title}" booked!`,
                        body: ` <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                                    <h2>Hi ${populated.user.name},</h2>
                                    <p>Your booking for <strong style=\"color: #F84565;\">"${populated.show.movie.title}"</strong> is confirmed.</p>
                                    <p>
                                        <strong>Date:</strong> ${new Date(populated.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
                                        <strong>Time:</strong> ${new Date(populated.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                                    </p>
                                    <p>Enjoy the show! 🍿</p>
                                    <p>Thanks for booking with us!<br/>— Zinema by Dstudio</p>
                                </div>`,
                        attachments: [
                            { filename: 'ticket.ics', content: ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' }
                        ]
                    });
                }
            } catch (emailErr) {
                console.error('Failed to send confirmation email directly:', emailErr);
            }

            // Fire-and-forget background event
            try {
                await inngest.send({ name: 'app/show.booked', data: { bookingId } });
            } catch (e) {
                console.warn('Inngest not available; skipped background event:', e?.message || e);
            }
        }
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        console.log('Processing event type:', event.type);
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const bookingId = session?.metadata?.bookingId;
                console.log('Checkout session completed, bookingId:', bookingId);
                await finalizeBookingAndNotify(bookingId);
                break;
            }
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                console.log('Payment intent succeeded:', paymentIntent.id);
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                })

                const session = sessionList.data[0];
                const bookingId = session?.metadata?.bookingId;
                console.log('Found session for payment intent, bookingId:', bookingId);
                await finalizeBookingAndNotify(bookingId);
                
                break;
            }
        
            default:
                console.log('Unhandled event type:', event.type)
        }
        response.json({received: true})
    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).send("Internal Server Error");
    }
}