import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Follow from "../models/Follow.js";

export const getUserBookings = async (req, res)=>{
    try {
        const user = req.auth().userId;

        const bookings = await Booking.find({user}).populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const updateFavorite = async (req, res)=>{
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId)

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = []
        }

        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, {privateMetadata: user.privateMetadata})

        res.json({success: true, message: "Favorite movies updated" })
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getFavorites = async (req, res) =>{
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favorites = user.privateMetadata.favorites;

        const movies = await Movie.find({_id: {$in: favorites}})

        res.json({success: true, movies})
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const followUser = async (req, res) => {
    try {
        const follower = req.auth().userId;
        const { userId: following } = req.params;
        if (follower === following) return res.json({ success: false, message: 'Cannot follow yourself' });
        await Follow.create({ follower, following });
        res.json({ success: true });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: true });
        }
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const follower = req.auth().userId;
        const { userId: following } = req.params;
        await Follow.deleteOne({ follower, following });
        res.json({ success: true });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getFollowing = async (req, res) => {
    try {
        const follower = req.auth().userId;
        const rows = await Follow.find({ follower });
        res.json({ success: true, following: rows.map(r => r.following) });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}