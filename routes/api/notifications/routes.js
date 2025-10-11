import express from "express";
import {
  send_notification_to_all,
  send_notification_to_user,
  get_user_notifications,
  mark_notification_as_read,
  delete_notification,
  send_queue_notification,
  send_system_announcement
} from "../../../controllers/api/notifications_api_controller.js";

const router = express.Router();

/**
 * @route   POST /api/notifications/send/all
 * @desc    Send a notification to all users
 * @access  Public
 */
router.post("/send/all", send_notification_to_all);



/**
 * @route   POST /api/notifications/send/user
 * @desc    Send a notification to a specific user
 * @access  Public
 */
router.post("/send/user", send_notification_to_user);

/**
 * @route   POST /api/notifications/send/queue
 * @desc    Send a notification related to a queue event
 * @access  Public
 */
router.post("/send/queue", send_queue_notification);

/**
 * @route   POST /api/notifications/send/announcement
 * @desc    Send a system-wide announcement notification
 * @access  Public
 */
router.post("/send/announcement", send_system_announcement);

/**
 * @route   GET /api/notifications/user/:userId
 * @desc    Get all notifications for a specific user
 * @access  Public
 */
router.get("/user/:userId", get_user_notifications);

/**
 * @route   PATCH /api/notifications/read/:notificationId
 * @desc    Mark a notification as read by its ID
 * @access  Public
 */
router.patch("/read/:notificationId", mark_notification_as_read);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a notification by its ID
 * @access  Public
 */
router.delete("/:notificationId", delete_notification);

export default router;