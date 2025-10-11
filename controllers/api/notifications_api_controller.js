import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import {
  emit_system_announcement,
  emit_user_notification
}
  from "../../utilites/notifications_socket.js";






/**
 * @function send_notification_to_all
 * @desc    Send a notification to all users (broadcast).
 * @param   {object} req - Express request object, expects title and message in body.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and message.
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

    // Prepare notification payload
    const notificationPayload = {
      id: notifications._id,
      title,
      message,
      read: false,
      createdAt: notifications.createdAt,
      type: 'notification'
    };

    // Emit via Socket.IO to all users using utility function
    const io = req.app.get('io');
    if (io) {
      emit_system_announcement(io, notificationPayload)
      // broadcastAnnouncement(io, { title, message, type: 'notification' });
    }
    res.status(200).json({ status: 200, message: "Notification sent to all users" });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to send notifications",
      error: error.message
    });
  }
};






/**
 * @function send_notification_to_user
 * @desc    Send a notification to a specific user.
 * @param   {object} req - Express request object, expects title, message, and userId in body.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and message.
 */
export const send_notification_to_user = async (req, res) => {
  try {
    const { title, message, userId } = req.body;
    // store notification in the database
    const notification = await Notification.create({ title, message, user: userId });

    // Prepare notification payload
    const notificationPayload = {
      id: notification._id,
      title,
      message,
      read: false,
      createdAt: notification.createdAt,
      type: 'notification'
    };

    // Get the io instance
    const io = req.app.get('io');
    emit_user_notification(io, userId, notificationPayload);
    res.json({ status: 200, message: "Notification sent to user" });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to send notification to user",
      error: error.message
    });
  }
};





/**
 * @function get_user_notifications
 * @desc    Get all notifications for a specific user.
 * @param   {object} req - Express request object, expects userId in params.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and array of notifications.
 */
export const get_user_notifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: 200, notifications });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};






/**
 * @function mark_notification_as_read
 * @desc    Mark a notification as read by its ID.
 * @param   {object} req - Express request object, expects notificationId in params.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and message.
 */
export const mark_notification_as_read = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).
      json({
        status: 200,
        message: "Notification marked as read"
      });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to mark notification as read",
      error: error.message
    })
  }
};





/**
 * @function delete_notification
 * @desc    Delete a notification by its ID.
 * @param   {object} req - Express request object, expects notificationId in params.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and message.
 */
export const delete_notification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ status: 200, message: "Notification deleted" });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to delete notification",
      error: error.message
    })
  }
};



/**
 * @function send_system_announcement
 * @desc    Send a system-wide announcement to all users.
 * @param   {object} req - Express request object, expects title, message, and optional priority in body.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status and message.
 */
export const send_system_announcement = async (req, res) => {
  try {
    const { title, message, priority = 'normal' } = req.body;

    // For system announcements, we might not save to individual user notifications
    // Instead, we could have a separate announcements collection or just broadcast

    const io = req.app.get('io');
    if (io) {
      broadcastAnnouncement(io, {
        title,
        message,
        priority,
        type: 'system_announcement'
      });
    }



    res.json({
      status: 200,
      message: "System announcement sent"
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to send system announcement",
      error: error.message
    })
  }
};




/**
 * Send queue-related notification to user
 */
export const send_queue_notification = async (req, res) => {
  try {
    const { title, message, userId, queueId, type = 'queue_update' } = req.body;

    // Save notification to database
    const notification = await Notification.create({
      title,
      message,
      user: userId
    });

    // Emit via Socket.IO to the user using utility function
    const io = req.app.get('io');
    if (io) {
      emitUserNotification(io, userId, {
        id: notification._id,
        title,
        message,
        read: false,
        createdAt: notification.createdAt,
        type,
        queueId
      });
    }



    res.json({ status: 200, message: "Queue notification sent to user" });
  } catch (error) {
    res.json({
      status: 500,
      message: "Failed to send queue notification",
      error: error.message
    })
  }
};