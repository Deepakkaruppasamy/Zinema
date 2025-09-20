import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next)=>{
    try {
        const { userId } = req.auth();

        const user = await clerkClient.users.getUser(userId)

        if(user.privateMetadata.role !== 'admin'){
            return res.json({success: false, message: "not authorized"})
        }

        // Attach user info to request object for controllers to use
        req.user = {
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.privateMetadata.role
        };

        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" });
    }
}