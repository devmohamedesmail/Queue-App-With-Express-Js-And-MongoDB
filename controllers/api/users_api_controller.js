
import connectDB from "../../config/db.js"
import User from "../../models/User.js";


export const show_users = async (req, res) => {
    try {
        await connectDB();
        const users = await User.find();
        res.json({ 
            status: 200, 
            message:"Users Fetched success",
            users: users });
    } catch (error) {
        res.json({ 
            status: 400, 
            message: "Failed To Fetch users",
            error:error.message
        });
    }
}