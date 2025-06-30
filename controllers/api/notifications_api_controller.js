import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import { logEvent } from "../../utilites/logEvent.js";
import { handleError } from "../../utilites/handleError.js";

/**
 * Send notification to all users (broadcast)
 */
export const send_notification_to_all = async (req, res) => {
  try {
    const { title, message } = req.body;
    const users = await User.find({}, '_id');
    const notifications = users.map(user => ({
      title,
      message,
      user: user._id
    }));
    await Notification.insertMany(notifications);

    // Emit via Socket.IO to all users
    const io = req.app.get('io');
    if (io) {
      io.emit('notification', { title, message });
    }
    await logEvent({ message: 'Notification sent to all users', level: 'info' });
    res.status(200).json({ status: 200, message: "Notification sent to all users" });
  } catch (error) {
    await logEvent({ message: 'Error sending notification to all users', level: 'error', meta: { error: error.message } });
    handleError(res, error, 500, "Failed to send notifications");
  }
};

/**
 * Send notification to a specific user
 */
export const send_notification_to_user = async (req, res) => {
  try {
    const { title, message, userId } = req.body;
    const notification = await Notification.create({ title, message, user: userId });

    // Emit via Socket.IO to the user room
    const io = req.app.get('io');
    if (io) {
      io.to(`${userId}`).emit('notification', { title, message });
    }
    await logEvent({ message: 'Notification sent to user', level: 'info', meta: { userId } });
    res.json({ status: 200, message: "Notification sent to user" });
  } catch (error) {
    await logEvent({ message: 'Error sending notification to user', level: 'error', meta: { error: error.message } });
    handleError(res, error, 500, "Failed to send notification");
  }
};

/**
 * Get all notifications for a user
 */
export const get_user_notifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: 200, notifications });
  } catch (error) {
    await logEvent({ message: 'Error fetching notifications for user', level: 'error', meta: { error: error.message } });
    handleError(res, error, 500, "Failed to fetch notifications");
  }
};

/**
 * Mark a notification as read
 */
export const mark_notification_as_read = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ status: 200, message: "Notification marked as read" });
  } catch (error) {
    await logEvent({ message: 'Error marking notification as read', level: 'error', meta: { error: error.message } });
    handleError(res, error, 500, "Failed to mark notification as read");
  }
};

/**
 * Delete a notification
 */
export const delete_notification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ status: 200, message: "Notification deleted" });
  } catch (error) {
    await logEvent({ message: 'Error deleting notification', level: 'error', meta: { error: error.message } });
    handleError(res, error, 500, "Failed to delete notification");
  }
};