import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {type: String, required: true, ref: 'User'},
    show: {type: String, required: true, ref: 'Show'},
    amount: {type: Number, required: true},
    bookedSeats: {type: Array, required: true},
    couponCode: {type: String},
    discountAmount: {type: Number, default: 0},
    greenTicketingDonation: {type: Number, default: 0},
    isPaid: {type: Boolean,  default:false},
    paymentLink: {type: String},
},{timestamps: true })

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;