import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    preferences: {
        remindersEnabled: { type: Boolean, default: true }
    },
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ["BRONZE","SILVER","GOLD","PLATINUM"], default: "BRONZE" }
})

const User = mongoose.model('User', userSchema)

export default User;