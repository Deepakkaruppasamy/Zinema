import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";
import TrendingConfig from "../models/TrendingConfig.js";


// API to check if user is admin
export const isAdmin = async (req, res) =>{
    res.json({success: true, isAdmin: true})
}

// Simple risk flags (basic heuristics)
export const getRiskFlags = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 7);

        const recent = await Booking.find({ createdAt: { $gte: since } }).lean();
        const byUser = recent.reduce((m, b) => {
            m[b.user] = (m[b.user] || 0) + 1; return m;
        }, {})
        const manyBookingsUsers = Object.entries(byUser)
            .filter(([_, cnt]) => cnt >= 10)
            .map(([user, cnt]) => ({ user, count: cnt }))

        const zeroPaid = recent.filter(b => b.isPaid && (b.amount <= 0))

        res.json({ success: true, flags: {
            heavyUsers: manyBookingsUsers,
            zeroPaid
        }})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data
export const getDashboardData = async (req, res) =>{
    try {
        const [bookings, activeShows, totalUser] = await Promise.all([
            Booking.find({isPaid: true}),
            Show.find({showDateTime: {$gte: new Date()}}).populate('movie'),
            User.countDocuments()
        ])

        // Occupancy metrics (assume 90 seats per show as per UI 10x9)
        const capacityPerShow = 90;
        const showsWithOccupancy = activeShows.map(s => {
            const taken = Object.keys(s.occupiedSeats || {}).length;
            const occupancy = capacityPerShow ? Math.min(100, Math.round((taken / capacityPerShow) * 100)) : 0;
            return {
                _id: s._id,
                movie: s.movie,
                showDateTime: s.showDateTime,
                taken,
                capacity: capacityPerShow,
                occupancy
            }
        })

        const avgOccupancy = showsWithOccupancy.length
            ? Math.round(showsWithOccupancy.reduce((a, s) => a + s.occupancy, 0) / showsWithOccupancy.length)
            : 0;

        // Revenue by day (last 30 days)
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const revenueByDayAgg = await Booking.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: since } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                revenue: { $sum: "$amount" },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 }}
        ])

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            avgOccupancy,
            shows: showsWithOccupancy,
            revenueByDay: revenueByDayAgg.map(r => ({ date: r._id, revenue: r.revenue, count: r.count })),
            totalUser
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows
export const getAllShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 })
        res.json({success: true, shows})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({ createdAt: -1 })
        res.json({success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// Get curated trending list (movieIds)
export const getCuratedTrending = async (req, res) => {
    try {
        const doc = await TrendingConfig.findById("curated");
        res.json({ success: true, movieIds: doc?.movieIds || [], showIds: doc?.showIds || [] });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Set curated trending list (movieIds)
export const setCuratedTrending = async (req, res) => {
    try {
        const { movieIds, showIds } = req.body;

        const normalizeIds = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) {
                return val
                    .map(v => typeof v === 'string' ? v : (v && v._id ? String(v._id) : null))
                    .filter(Boolean);
            }
            if (typeof val === 'string') return [val];
            return [];
        };

        const normShowIds = normalizeIds(showIds);
        const normMovieIds = normalizeIds(movieIds);
        const doc = await TrendingConfig.findByIdAndUpdate(
            "curated",
            { movieIds: normMovieIds, showIds: normShowIds, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, movieIds: doc.movieIds, showIds: doc.showIds });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}