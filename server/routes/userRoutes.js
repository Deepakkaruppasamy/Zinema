import express from "express";
import { getFavorites, getUserBookings, updateFavorite, followUser, unfollowUser, getFollowing } from "../controllers/userController.js";
import { getUserStats } from "../controllers/gamificationController.js";

const userRouter = express.Router();

userRouter.get('/bookings', getUserBookings)
userRouter.post('/update-favorite', updateFavorite)
userRouter.get('/favorites', getFavorites)
userRouter.post('/follow/:userId', followUser)
userRouter.delete('/follow/:userId', unfollowUser)
userRouter.get('/following', getFollowing)
userRouter.get('/gamification', getUserStats)

export default userRouter;