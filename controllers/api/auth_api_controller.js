import connectDB from "../../config/db.js";
import Role from "../../models/Role.js";
import User from "../../models/User.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Log from "../../models/Log.js";
import { handleError } from "../../utilites/handleError.js"; 
import { generateToken } from "../../utilites/generateToken.js"; 
import { logEvent } from "../../utilites/logEvent.js";


/**
 * Register a new user
 * - Validates input
 * - Checks for existing email
 * - Hashes password
 * - Creates user and role
 * - Logs the event
 * - Returns JWT token
 */
export const register_user = async (req, res) => {
  try {
    await connectDB();
    const { email, password, name } = req.body;

    if (!email || !password) {
      await logEvent({ message: 'Registration failed: missing email or password', level: 'warn', meta: { email } });
      res.status(400).json({ status: 400, message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await logEvent({ message: 'Registration failed: email already exists', level: 'warn', meta: { email } });
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

    await logEvent({ user: newUser._id, message: 'User registered successfully', level: 'info' });
    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      user: {
        ...newUser.toObject(),
        token,
      },
    });
  } catch (error) {
    await logEvent({ message: 'Registration error', level: 'error', meta: { error: error.message } });
    handleError(res, error);
  }
};

/**
 * Login user
 * - Validates input
 * - Checks user existence and password
 * - Logs the event
 * - Returns JWT token
 */
export const login_user = async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      await logEvent({ message: 'Login failed: missing email or password', level: 'warn', meta: { email } });
      res.status(400).json({ status: 400, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      await logEvent({ message: 'Login failed: invalid email or password', level: 'warn', meta: { email } });
      res.status(401).json({ status: 401, message: "Invalid email or passwordd" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logEvent({ user: user._id, message: 'Login failed: invalid password', level: 'warn', meta: { email } });
      res.status(401).json({ status: 401, message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id);

    await logEvent({ user: user._id, message: 'User logged in successfully', level: 'info' });
    res.json({
      status: 200,
      message: "Login successful",
      user: {
        ...user.toObject(),
        token,
      },
    });
  } catch (error) {
    await logEvent({ message: 'Login error', level: 'error', meta: { error: error.message } });
    handleError(res, error);
  }
};

/**
 * Edit user profile
 * - Finds user by ID
 * - Updates fields if provided
 * - Hashes new password if provided
 * - Logs the event
 */
export const edit_user = async (req, res) => {
  try {
    await connectDB();
    const userId = req.params.userId;
    const { name, phone, address, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      await logEvent({ message: 'Edit user failed: user not found', level: 'warn', meta: { userId } });
      res.status(404).json({ status: 404, message: "User not found" });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    await logEvent({ user: user._id, message: 'User updated successfully', level: 'info' });
    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      user: user.toObject(),
    });
  } catch (error) {
    await logEvent({ message: 'Edit user error', level: 'error', meta: { error: error.message } });
    handleError(res, error);
  }
};

/**
 * Delete user account
 * - Finds and deletes user by ID
 * - Logs the event
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

    await logEvent({ user: user._id, message: 'User deleted successfully', level: 'info' });
    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    await logEvent({ message: 'Delete user error', level: 'error', meta: { error: error.message } });
    handleError(res, error, 400);
  }
};



