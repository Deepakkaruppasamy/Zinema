import stripe from "stripe";
import Booking from '../models/Booking.js'
import { inngest } from "../inngest/index.js";
import { updateBookingStats } from "./gamificationController.js";

export const stripeWebhooks = async (request, response)=>{
    try {
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const sig = request.headers["stripe-signature"];

        let event;

        try {
            event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        } catch (error) {
            console.error("Webhook signature verification failed:", error.message);
            return response.status(400).send(`Webhook Error: ${error.message}`);
        }

        console.log(`Processing webhook event: ${event.type}`);

        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                console.log(`Payment succeeded for intent: ${paymentIntent.id}`);

                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                })

                if (sessionList.data.length === 0) {
                    console.error("No session found for payment intent:", paymentIntent.id);
                    return response.status(400).json({error: "No session found"});
                }

                const session = sessionList.data[0];
                const { bookingId } = session.metadata;

                if (!bookingId) {
                    console.error("No bookingId in session metadata");
                    return response.status(400).json({error: "No bookingId found"});
                }

                console.log(`Updating booking: ${bookingId}`);

                const booking = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ""
                }, { new: true })

                if (!booking) {
                    console.error("Booking not found:", bookingId);
                    return response.status(404).json({error: "Booking not found"});
                }

                console.log(`Booking updated successfully: ${bookingId}`);

                // Track green ticketing donation
                if (booking.greenTicketingDonation > 0) {
                    console.log(`Green donation processed: ₹${booking.greenTicketingDonation} for booking ${bookingId}`);
                    // Here you could add logic to track total environmental donations
                    // The frontend will handle updating the green ticketing totals via localStorage
                }

                // Update gamification stats for payment completion
                try {
                    await updateBookingStats(booking.userId, booking.amount, booking.bookedSeats.length > 1, true); // true = payment completion
                    console.log("Gamification stats updated for payment");
                } catch (error) {
                    console.error("Error updating gamification stats:", error);
                    // Don't fail the webhook for gamification errors
                }

                // Send Confirmation Email
                try {
                    console.log("📧 Sending Inngest event for booking:", bookingId);
                    const inngestResult = await inngest.send({
                        name: "app/show.booked",
                        data: {bookingId}
                    });
                    console.log("✅ Confirmation email queued successfully:", inngestResult);
                } catch (error) {
                    console.error("❌ Error sending confirmation email:", error);
                    // Don't fail the webhook for email errors
                }
                
                break;
            }
        
            default:
                console.log('Unhandled event type:', event.type)
        }
        
        response.json({received: true})
    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).json({error: "Internal Server Error", message: err.message});
    }
}