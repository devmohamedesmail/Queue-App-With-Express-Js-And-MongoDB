import connectDB from "../../config/db.js";
import Role from "../../models/Role.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
export const get_Users_By_PlaceId = async (req, res) => {
    try {
        await connectDB();
        const { placeId } = req.params;
        if (!placeId) {
            return res.status(400).json({ message: 'placeId is required' });
        }
        const users = await User.find({ placeId });
        res.status(200).json({
            status: 200,
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}




export const add_new_user_to_place = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const { name, email, password, serviceId } = req.body;

      

        // Check if user already exists with the same email and placeId
        const existingUser = await User.findOne({ email, placeId });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists for this place' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            serviceId,
            role: 'employee',
            placeId
        });

        await newUser.save();
       const role = new Role({
            user_id: newUser._id,
            role: 'employee',
            parent_role: 'subscriber',
            place_id: placeId
        });

        await role.save();

        res.status(201).json({
            status: 201,
            message: 'User added successfully',
            data: newUser,
            role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}