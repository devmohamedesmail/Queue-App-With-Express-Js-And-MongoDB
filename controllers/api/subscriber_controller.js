// Import dependencies and utilities
import connectDB from "../../config/db.js";
import Role from "../../models/Role.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import { handleError } from "../../utilites/handleError.js";
import { logEvent } from "../../utilites/logEvent.js";
import Queue from "../../models/Queue.js";
import { emitQueueUpdate,  emitQueueStatusChange } from "../../utilites/socketUtils.js";
import { emit_queue_update, emit_queue_user_update } from "../../utilites/queues_socket.js";

/**
 * Get all users by placeId
 * @route GET /users/:placeId
 * @desc Returns all users for a given place
 */
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
        await logEvent({ message: 'Error in get_Users_By_PlaceId', level: 'error', meta: { error: error.message } });
        handleError(res, error, 500, 'Failed to fetch users by placeId');
    }
}

/**
 * Add a new user to a place
 * @route POST /add/user/:placeId
 * @desc Adds a new employee user to a place
 */
export const add_new_user_to_place = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const { name, email, password, serviceId } = req.body;

        // Check if user already exists with the same email and placeId
        const existingUser = await User.findOne({ email, placeId });
        if (existingUser) {
            logEvent(`User already exists for email: ${email} and placeId: ${placeId}`, 'warn');
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

        await logEvent({ message:`Added new user: ${email} to placeId: ${placeId}`, level: 'info', });
        res.status(201).json({
            status: 201,
            message: 'User added successfully',
            data: newUser,
            role
        });
    } catch (error) {
        logEvent(`Error in add_new_user_to_place: ${error.message}`, 'error');
        handleError(res, error, 'Failed to add new user to place');
    }
}

/**
 * Delete a user by ID (subscriber)
 * @route GET /delete/user/subscriber/:userId
 * @desc Deletes a user by their ID
 */
export const delete_user_by_id_subscriber = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await logEvent({ message: `Deleted user with ID: ${userId}`, level: 'info' });
        res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
            data: user
        });
    } catch (error) {
        await logEvent({ message: `Error in delete_user_by_id: ${error.message}`, level: 'error' });
        handleError(res, error, 'Failed to delete user');
    }
}

/**
 * Toggle a user's active status (activate/deactivate)
 * @route GET /toggle/deactive/user/subscriber/:userId
 * @desc Toggles the isActive status of a user
 */
export const toggle_deactive_user_by_id_subscriber = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        const action = user.isActive ? 'Activated' : 'Deactivated';
        await logEvent({ message: `${action} user with ID: ${userId}`, level: 'info' });
        res.status(200).json({
            status: 200,
            message: `User ${action.toLowerCase()} successfully`,
            data: user
        });
    } catch (error) {
        await logEvent({ message: `Error in toggle_deactive_user_by_id_subscriber: ${error.message}`, level: 'error' });
        handleError(res, error, 'Failed to toggle user active status');
    }
}

/**
 * Activate a queue by employee (subscriber)
 * @route GET /active/queue/:queueId/:userId
 * @desc Activates a queue and assigns it to an employee
 */
export const active_queue_by_employee = async (req, res) => {
    try {
        await connectDB();
        const queueId = req.params.queueId;
        const userId = req.params.userId;
        const queue = await Queue.findById(queueId);
        if (!queue) {
            await logEvent({ message: 'Activate queue failed: queue not found', level: 'warn', meta: { queueId } });
            return res.status(404).json({ message: "Queue not found" });
        }
        const employee = await User.findById(userId);
        queue.status = "active";
        queue.employee = employee;
        queue.employee_id = employee._id;
        const queue_updated = await queue.save();
        // Emit real-time update for queue activation


        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${queue.placeId}_service_${queue.serviceId}`;
            emit_queue_update(io, roomId,{
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Queue is now being served'
            })
            
            emit_queue_user_update(io, `user_${queue.userId}`, {
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Your turn! Please proceed to the service counter'
            })
            
        }
        await logEvent({ user: queue.userId, message: 'Queue activated for subscriber', level: 'info', meta: { queueId: queue._id } });
        res.json({
            status: 200,
            message: 'Queue activated successfully',
            data: queue_updated,
        });
    } catch (error) {
        await logEvent({ message: 'Error activating queue for subscriber', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to activate queue');
    }
}

/**
 * Cancel a queue by employee (subscriber)
 * @route GET /cancel/queue/:queueId/:userId
 * @desc Cancels a queue and assigns the cancellation to an employee
 */
export const cancel_queue_by_employee = async (req, res) => {
    try {
        await connectDB();
        const queueId = req.params.queueId;
        const userId = req.params.userId;
        const queue = await Queue.findById(queueId);
        if (!queue) {
            await logEvent({ message: 'Activate queue failed: queue not found', level: 'warn', meta: { queueId } });
            return res.status(404).json({ message: "Queue not found" });
        }
        const employee = await User.findById(userId);
        queue.status = "cancelled";
        queue.employee = employee;
        const queue_updated = await queue.save();
        // Emit real-time update for queue activation
        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${queue.placeId}_service_${queue.serviceId}`;
            emitQueueStatusChange(io, roomId, {
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Queue is now being served'
            });
            emitQueueStatusChange(io, `user_${queue.userId}`, {
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Your turn! Please proceed to the service counter'
            });
            emitQueueUpdate(io, roomId, {
                type: 'position_update',
                message: 'Queue positions updated'
            });
        }
        await logEvent({ user: queue.userId, message: 'Queue activated for subscriber', level: 'info', meta: { queueId: queue._id } });
        res.json({
            status: 200,
            data: queue_updated,
        });
    } catch (error) {
        await logEvent({ message: 'Error activating queue for subscriber', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to activate queue');
    }
}














