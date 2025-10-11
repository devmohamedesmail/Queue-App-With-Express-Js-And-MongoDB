import connectDB from "../../config/db.js";
import Role from "../../models/Role.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import { handleError } from "../../utilites/handleError.js";
import { generateToken } from "../../utilites/generateToken.js";
import { logEvent } from "../../utilites/logEvent.js";


/**
 * Register a new user
 * --------------------------------------------------------
 * @param {object} req - Express request object, expects { email, password, name } in body
 * @param {object} res - Express response object
 * @returns {object} JSON response with status, message, user object, and JWT token
 */
export const register_user = async (req, res) => {
  try {
    await connectDB();
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 400, message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ status: 400, message: "Email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    const role = new Role({ user_id: newUser._id, role: "user" });
    await role.save();

    const token = generateToken(newUser._id);
    // Delete the password
    const userData = newUser.toObject();
    delete userData.password;

    userData.token = token;

    res.json({
      status: 201,
      message: "success",
      user: userData,
    });
  } catch (error) {
    handleError(res, error);

  }
};

/**
 * Login user
 * --------------------------------------------------------
 * @param {object} req - Express request object, expects { email, password } in body
 * @param {object} res - Express response object
 * @returns {object} JSON response with status, message, user object, and JWT token
 */
export const login_user = async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 400, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      res.json({ status: 401, message: "Invalid email or passwordd" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.json({ status: 401, message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id);
    // Remove the password 
    const userData = user.toObject();
    delete userData.password;
    userData.token = token;
    res.json({
      status: 200,
      message: "success",
      user: userData,
    });
  } catch (error) {
    await logEvent({ message: 'Login error', level: 'error', meta: { error: error.message } });
    handleError(res, error);
  }
};

/**
 * Edit user profile
 * --------------------------------------------------------
 * @param {object} req - Express request object, expects userId in params and { name, phone, address, email, password } in body
 * @param {object} res - Express response object
 * @returns {object} JSON response with status, message, and updated user object
 */
export const edit_user = async (req, res) => {
  try {
    await connectDB();
    const userId = req.params.userId;
    const { name, phone, address, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (email !== undefined) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle avatar upload
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      user.avatar = uploadResult.secure_url;
    }

    await user.save();
    res.json({
      status: 200,
      message: "User updated successfully",
      user: user.toObject(),
    });
  } catch (error) {
    res.json({
      status: 404,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * --------------------------------------------------------
 * @param {object} req - Express request object, expects userId in params
 * @param {object} res - Express response object
 * @returns {object} JSON response with status and message
 */
export const delete_user = async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      await logEvent({ message: 'Delete user failed: user not found', level: 'warn', meta: { userId } });
      res.status(404).json({ status: 404, message: "User not found" });
      return;
    }

    res.status(200).json({
      status: 200,
      message: "success",
    });
  } catch (error) {
    res.json({
      status: 404,
      message: 'Error Delete user',
      error: error.message,
    });
  }
};



