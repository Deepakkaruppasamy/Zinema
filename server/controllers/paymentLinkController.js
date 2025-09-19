import PaymentLink from "../models/PaymentLink.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import stripe from "stripe";

const checkSeatsAvailability = async (showId, seats) => {
  const show = await Show.findById(showId);
  if (!show) return { ok: false, reason: "Show not found" };
  const occupied = show.occupiedSeats || {};
  const taken = seats.some((s) => occupied[s]);
  if (taken) return { ok: false, reason: "Some seats are already taken" };
  return { ok: true, show };
};

export const createPaymentLink = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, seats, expiryMinutes = 10 } = req.body;
    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.json({ success: false, message: "showId and seats[] are required" });
    }

    const result = await checkSeatsAvailability(showId, seats);
    if (!result.ok) return res.json({ success: false, message: result.reason });

    const expiresAt = new Date(Date.now() + Math.max(5, expiryMinutes) * 60 * 1000);

    const link = await PaymentLink.create({
      show: showId,
      seats,
      createdBy: userId,
      expiresAt,
    });

    const show = result.show;
    // Lock seats under placeholder owner id
    for (const s of seats) show.occupiedSeats[s] = `link:${link._id.toString()}`;
    show.markModified("occupiedSeats");
    await show.save();

    res.json({ success: true, id: link._id.toString(), expiresAt });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

export const checkoutPaymentLink = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const { origin } = req.headers;

    const link = await PaymentLink.findById(id);
    if (!link || link.status !== "active") {
      return res.json({ success: false, message: "Invalid or inactive link" });
    }
    if (link.expiresAt <= new Date()) {
      return res.json({ success: false, message: "Link expired" });
    }

    const show = await Show.findById(link.show).populate("movie");
    if (!show) return res.json({ success: false, message: "Show not found" });

    // Ensure seats are still owned by this link
    for (const s of link.seats) {
      if (show.occupiedSeats[s] !== `link:${link._id.toString()}`) {
        return res.json({ success: false, message: "Seats are no longer available" });
      }
    }

    // Create a booking for this user using the seats
    const booking = await Booking.create({
      user: userId,
      show: show._id.toString(),
      amount: show.showPrice * link.seats.length,
      bookedSeats: link.seats,
    });

    // Assign seats to user
    for (const s of link.seats) show.occupiedSeats[s] = userId;
    show.markModified("occupiedSeats");
    await show.save();

    // Create Stripe session
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: show.movie.title },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items,
      mode: "payment",
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Mark link as used (to prevent multiple consumption). Seats already assigned to user.
    link.status = "used";
    link.stripeSessionId = session.id;
    await link.save();

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};
