import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import TrendingConfig from "../models/TrendingConfig.js";


export const isAdmin = async (req, res) =>{
    res.json({success: true, isAdmin: true})
}

export const getRiskFlags = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recent = await Booking.find({ createdAt: { $gte: since } }).lean();
        const allRecent = await Booking.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();

        const byUser = recent.reduce((m, b) => {
            m[b.user] = (m[b.user] || 0) + 1; return m;
        }, {})
        const manyBookingsUsers = Object.entries(byUser)
            .filter(([_, cnt]) => cnt >= 10)
            .map(([user, cnt]) => ({ user, count: cnt }))

        const zeroPaid = recent.filter(b => b.isPaid && (b.amount <= 0))

        const suspiciousPatterns = [];
        
        const rapidBookings = recent.filter((booking, index, arr) => {
            const timeDiff = index > 0 ? 
                new Date(booking.createdAt) - new Date(arr[index - 1].createdAt) : 
                Infinity;
            return timeDiff < 60000;
        });

        const highValueBookings = recent.filter(b => b.amount > 1000);

        const totalBookings = allRecent.length;
        const cancelledBookings = allRecent.filter(b => b.status === 'cancelled').length;
        const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

        const dailyRevenue = {};
        allRecent.forEach(b => {
            const date = new Date(b.createdAt).toISOString().split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + b.amount;
        });

        const revenueValues = Object.values(dailyRevenue);
        const avgRevenue = revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length;
        const revenueAnomalies = Object.entries(dailyRevenue)
            .filter(([_, revenue]) => Math.abs(revenue - avgRevenue) > avgRevenue * 0.5)
            .map(([date, revenue]) => ({ date, revenue, deviation: ((revenue - avgRevenue) / avgRevenue * 100).toFixed(1) }));

        const hasRealData = recent.length > 0 || allRecent.length > 0;
        
        let riskFlags = {
            heavyUsers: manyBookingsUsers,
            zeroPaid,
            rapidBookings: rapidBookings.length,
            highValueBookings: highValueBookings.length,
            cancellationRate: Math.round(cancellationRate * 100) / 100,
            revenueAnomalies,
            riskScore: calculateRiskScore({
                heavyUsers: manyBookingsUsers.length,
                zeroPaid: zeroPaid.length,
                rapidBookings: rapidBookings.length,
                highValueBookings: highValueBookings.length,
                cancellationRate
            })
        };

        if (!hasRealData && process.env.NODE_ENV !== 'production') {
            console.log('No real risk data found, generating sample data for development');
            
            const sampleHeavyUsers = [
                { user: 'user-123', count: 15, name: 'John Doe', email: 'john@example.com' },
                { user: 'user-456', count: 12, name: 'Jane Smith', email: 'jane@example.com' },
                { user: 'user-789', count: 11, name: 'Bob Johnson', email: 'bob@example.com' }
            ];

            const sampleZeroPaid = [
                { _id: 'booking-1', user: 'user-123', amount: 0, createdAt: new Date() },
                { _id: 'booking-2', user: 'user-456', amount: 0, createdAt: new Date() }
            ];

            const sampleRevenueAnomalies = [
                { date: '2024-01-15', revenue: 2500, deviation: 150.5 },
                { date: '2024-01-20', revenue: 3200, deviation: 200.0 },
                { date: '2024-01-25', revenue: 1800, deviation: -25.3 }
            ];

            riskFlags = {
                heavyUsers: sampleHeavyUsers,
                zeroPaid: sampleZeroPaid,
                rapidBookings: 3,
                highValueBookings: 2,
                cancellationRate: 12.5,
                revenueAnomalies: sampleRevenueAnomalies,
                riskScore: calculateRiskScore({
                    heavyUsers: sampleHeavyUsers.length,
                    zeroPaid: sampleZeroPaid.length,
                    rapidBookings: 3,
                    highValueBookings: 2,
                    cancellationRate: 12.5
                })
            };
        }

        res.json({ 
            success: true, 
            flags: riskFlags
        })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

function calculateRiskScore(metrics) {
    let score = 0;
    
    score += Math.min(30, metrics.heavyUsers * 5);
    
    score += Math.min(25, metrics.zeroPaid * 10);
    
    score += Math.min(20, metrics.rapidBookings * 2);
    
    score += Math.min(15, metrics.highValueBookings * 3);
    
    if (metrics.cancellationRate > 20) score += 10;
    else if (metrics.cancellationRate > 10) score += 5;
    
    return Math.min(100, score);
}

export const getDashboardData = async (req, res) =>{
    try {
        const [allBookings, paidBookings, activeShows, totalUser, allUsers] = await Promise.all([
            Booking.find({}).populate('user').populate({
                path: 'show',
                populate: {path: 'movie'}
            }),
            Booking.find({isPaid: true}),
            Show.find({showDateTime: {$gte: new Date()}}).populate('movie'),
            User.countDocuments(),
            User.find({}).select('_id name email')
        ])

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

        const paidRevenue = paidBookings.reduce((acc, b) => acc + (b.amount || 0), 0)
        const totalAmountAllBookings = allBookings.reduce((acc, b) => acc + (b.amount || 0), 0)
        const totalRevenue = paidRevenue > 0 ? paidRevenue : totalAmountAllBookings
        const distinctUsersFromBookings = new Set(allBookings.map(b => b.user?._id || b.user).filter(Boolean)).size
        
        const actualUserCount = allUsers.length
        
        let totalUsersResolved = Math.max(totalUser, distinctUsersFromBookings, actualUserCount)
        
        if (totalUsersResolved === 0 && process.env.NODE_ENV !== 'production') {
            try {
                const testUser = await User.findOneAndUpdate(
                    { email: 'admin@zinema.com' },
                    {
                        _id: 'test-admin-user',
                        name: 'Admin User',
                        email: 'admin@zinema.com',
                        image: 'https://via.placeholder.com/150',
                        tier: 'PLATINUM'
                    },
                    { upsert: true, new: true }
                )
                totalUsersResolved = 1
                console.log('Created test admin user:', testUser._id)
            } catch (error) {
                console.error('Error creating test user:', error)
            }
        }
        
        console.log('User count debug:', {
            userCollectionCount: totalUser,
            actualUserCount,
            distinctUsersFromBookings,
            totalUsersResolved,
            allBookingsCount: allBookings.length,
            sampleUsers: allUsers.slice(0, 3).map(u => ({ id: u._id, name: u.name }))
        })

        const dashboardData = {
            totalBookings: allBookings.length,
            paidBookings: paidBookings.length,
            unpaidBookings: allBookings.length - paidBookings.length,
            totalRevenue,
            pendingRevenue: allBookings.filter(b => !b.isPaid).reduce((acc, booking)=> acc + (booking.amount || 0), 0),
            avgOccupancy,
            shows: showsWithOccupancy,
            revenueByDay: revenueByDayAgg.map(r => ({ date: r._id, revenue: r.revenue, count: r.count })),
            totalUser: totalUsersResolved,
            recentBookings: allBookings.slice(0, 10).map(booking => ({
                id: booking._id,
                user: booking.user?.name || 'Unknown',
                movie: booking.show?.movie?.title || 'Unknown',
                amount: booking.amount,
                seats: booking.bookedSeats.length,
                isPaid: booking.isPaid,
                createdAt: booking.createdAt
            }))
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

export const createTestUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        const testUser = await User.findOneAndUpdate(
            { email },
            {
                _id: `test-user-${Date.now()}`,
                name,
                email,
                image: 'https://via.placeholder.com/150',
                tier: 'BRONZE'
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Test user created successfully',
            user: {
                id: testUser._id,
                name: testUser.name,
                email: testUser.email
            }
        });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getAllShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 })
        res.json({success: true, shows})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

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

export const getCuratedTrending = async (req, res) => {
    try {
        const doc = await TrendingConfig.findById("curated");
        res.json({ success: true, movieIds: doc?.movieIds || [], showIds: doc?.showIds || [] });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

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

export const getAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        const revenueData = await Booking.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                dailyRevenue: { $sum: "$amount" },
                bookingCount: { $sum: 1 },
                avgBookingValue: { $avg: "$amount" }
            }},
            { $sort: { _id: 1 }}
        ]);

        const userAnalytics = await User.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                newUsers: { $sum: 1 }
            }},
            { $sort: { _id: 1 }}
        ]);

        const movieAnalytics = await Booking.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $lookup: {
                from: 'shows',
                localField: 'show',
                foreignField: '_id',
                as: 'showData'
            }},
            { $unwind: '$showData' },
            { $lookup: {
                from: 'movies',
                localField: 'showData.movie',
                foreignField: '_id',
                as: 'movieData'
            }},
            { $unwind: '$movieData' },
            { $group: {
                _id: '$movieData._id',
                title: { $first: '$movieData.title' },
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$amount' },
                avgRating: { $first: '$movieData.vote_average' }
            }},
            { $sort: { totalRevenue: -1 }},
            { $limit: 10 }
        ]);

        const showtimeAnalytics = await Booking.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $lookup: {
                from: 'shows',
                localField: 'show',
                foreignField: '_id',
                as: 'showData'
            }},
            { $unwind: '$showData' },
            { $group: {
                _id: { $hour: '$showData.showDateTime' },
                bookings: { $sum: 1 },
                revenue: { $sum: '$amount' }
            }},
            { $sort: { _id: 1 }}
        ]);

        const peakHours = showtimeAnalytics
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 3)
            .map(hour => ({
                hour: hour._id,
                bookings: hour.bookings,
                revenue: hour.revenue
            }));

        const totalVisitors = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const paidBookings = await Booking.countDocuments({ isPaid: true, createdAt: { $gte: startDate, $lte: endDate } });
        
        const allTimeVisitors = await User.countDocuments();
        const allTimeBookings = await Booking.countDocuments();
        const allTimePaidBookings = await Booking.countDocuments({ isPaid: true });
        
        const conversionFunnel = {
            visitors: totalVisitors || allTimeVisitors,
            bookings: totalBookings || allTimeBookings,
            paidBookings: paidBookings || allTimePaidBookings,
            conversionRate: (totalVisitors || allTimeVisitors) > 0 ? 
                (((totalBookings || allTimeBookings) / (totalVisitors || allTimeVisitors)) * 100).toFixed(2) : 0,
            paymentRate: (totalBookings || allTimeBookings) > 0 ? 
                (((paidBookings || allTimePaidBookings) / (totalBookings || allTimeBookings)) * 100).toFixed(2) : 0
        };

        const hasRealData = revenueData.length > 0 || userAnalytics.length > 0 || movieAnalytics.length > 0;
        
        let finalAnalytics = {
                period,
                dateRange: { start: startDate, end: endDate },
                revenue: {
                    daily: revenueData,
                    total: revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
                    avgDaily: revenueData.length > 0 ? 
                        (revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0) / revenueData.length).toFixed(2) : 0
                },
                users: {
                    daily: userAnalytics,
                    total: userAnalytics.reduce((sum, day) => sum + day.newUsers, 0)
                },
                movies: movieAnalytics,
                showtimes: showtimeAnalytics,
                peakHours,
                conversionFunnel
        };

        if (!hasRealData && process.env.NODE_ENV !== 'production') {
            console.log('No real analytics data found, generating sample data for development');
            
            const sampleRevenueData = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                sampleRevenueData.push({
                    _id: date.toISOString().split('T')[0],
                    dailyRevenue: Math.floor(Math.random() * 1000) + 200,
                    bookingCount: Math.floor(Math.random() * 20) + 5,
                    avgBookingValue: Math.floor(Math.random() * 50) + 25
                });
            }

            const sampleUserData = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                sampleUserData.push({
                    _id: date.toISOString().split('T')[0],
                    newUsers: Math.floor(Math.random() * 10) + 1
                });
            }

            const sampleMovies = [
                { title: 'Ne Zha 2', totalBookings: 45, totalRevenue: 2250, avgRating: 8.1 },
                { title: 'Mantis', totalBookings: 32, totalRevenue: 1600, avgRating: 6.3 },
                { title: 'Aztec Batman Clash of Empires', totalBookings: 28, totalRevenue: 1400, avgRating: 7.5 },
                { title: 'Primitive War', totalBookings: 25, totalRevenue: 1250, avgRating: 7.8 },
                { title: 'Prisoner of War', totalBookings: 22, totalRevenue: 1100, avgRating: 6.9 }
            ];

            const samplePeakHours = [
                { hour: 19, bookings: 15, revenue: 750 },
                { hour: 20, bookings: 18, revenue: 900 },
                { hour: 21, bookings: 12, revenue: 600 }
            ];

            finalAnalytics = {
                period,
                dateRange: { start: startDate, end: endDate },
                revenue: {
                    daily: sampleRevenueData,
                    total: sampleRevenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
                    avgDaily: (sampleRevenueData.reduce((sum, day) => sum + day.dailyRevenue, 0) / sampleRevenueData.length).toFixed(2)
                },
                users: {
                    daily: sampleUserData,
                    total: sampleUserData.reduce((sum, day) => sum + day.newUsers, 0)
                },
                movies: sampleMovies,
                showtimes: samplePeakHours,
                peakHours: samplePeakHours,
                conversionFunnel: {
                    visitors: 150,
                    bookings: 120,
                    paidBookings: 95,
                    conversionRate: '80.00',
                    paymentRate: '79.17'
                }
            };
        }

        res.json({
            success: true,
            analytics: finalAnalytics
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export const getRealtimeMetrics = async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

        const [recentBookings, recentUsers, activeShows] = await Promise.all([
            Booking.countDocuments({ createdAt: { $gte: last24h } }),
            User.countDocuments({ createdAt: { $gte: last24h } }),
            Show.countDocuments({ showDateTime: { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } })
        ]);

        const currentHourBookings = await Booking.countDocuments({ 
            createdAt: { $gte: lastHour } 
        });

        const liveShows = await Show.find({
            showDateTime: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), $lte: now }
        }).populate('movie');

        const liveOccupancy = liveShows.map(show => {
            const occupiedSeats = Object.keys(show.occupiedSeats || {}).length;
            const capacity = 90;
            return {
                showId: show._id,
                movie: show.movie?.title || 'Unknown',
                occupancy: Math.round((occupiedSeats / capacity) * 100),
                occupiedSeats,
                capacity
            };
        });

        const hasRealData = recentBookings > 0 || recentUsers > 0 || activeShows > 0;
        
        const allTimeBookings = await Booking.countDocuments();
        const allTimeUsers = await User.countDocuments();
        const allTimeShows = await Show.countDocuments();
        
        let realtimeData = {
                last24h: {
                    bookings: recentBookings || allTimeBookings,
                    newUsers: recentUsers || allTimeUsers,
                    activeShows: activeShows || allTimeShows
                },
                lastHour: {
                    bookings: currentHourBookings
                },
                liveOccupancy,
                serverTime: now.toISOString()
        };

        if (!hasRealData && process.env.NODE_ENV !== 'production') {
            console.log('No real realtime data found, generating sample data for development');
            
            realtimeData = {
                last24h: {
                    bookings: Math.floor(Math.random() * 25) + 5,
                    newUsers: Math.floor(Math.random() * 8) + 2,
                    activeShows: Math.floor(Math.random() * 5) + 3
                },
                lastHour: {
                    bookings: Math.floor(Math.random() * 5) + 1
                },
                liveOccupancy: [
                    {
                        showId: 'sample-show-1',
                        movie: 'Ne Zha 2',
                        occupancy: Math.floor(Math.random() * 40) + 30,
                        occupiedSeats: Math.floor(Math.random() * 36) + 27,
                        capacity: 90
                    },
                    {
                        showId: 'sample-show-2',
                        movie: 'Mantis',
                        occupancy: Math.floor(Math.random() * 30) + 20,
                        occupiedSeats: Math.floor(Math.random() * 27) + 18,
                        capacity: 90
                    }
                ],
                serverTime: now.toISOString()
            };
        }

        res.json({
            success: true,
            realtime: realtimeData
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}