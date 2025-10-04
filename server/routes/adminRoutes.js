import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import { 
    getAllBookings, 
    getAllShows, 
    getDashboardData, 
    isAdmin, 
    getCuratedTrending, 
    setCuratedTrending, 
    getRiskFlags,
    getAnalytics,
    getRealtimeMetrics,
    createTestUser
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get('/is-admin', protectAdmin, isAdmin)
adminRouter.get('/dashboard', protectAdmin, getDashboardData)
adminRouter.get('/all-shows', protectAdmin, getAllShows)
adminRouter.get('/all-bookings', protectAdmin, getAllBookings)
adminRouter.get('/trending', protectAdmin, getCuratedTrending)
adminRouter.post('/trending', protectAdmin, setCuratedTrending)
adminRouter.get('/risk-flags', protectAdmin, getRiskFlags)
adminRouter.get('/analytics', protectAdmin, getAnalytics)
adminRouter.get('/realtime', protectAdmin, getRealtimeMetrics)
adminRouter.post('/create-test-user', protectAdmin, createTestUser)

export default adminRouter;