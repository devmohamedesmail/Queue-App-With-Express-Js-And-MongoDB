import express from "express";
import {
  send_notification_to_all,
  send_notification_to_user,
  get_user_notifications,
  mark_notification_as_read,
  delete_notification
} from "../../../controllers/api/notifications_api_controller.js";

const router = express.Router();

router.post("/send/all", send_notification_to_all);
router.post("/send/user", send_notification_to_user);
router.get("/user/:userId", get_user_notifications);
router.patch("/read/:notificationId", mark_notification_as_read);
router.delete("/:notificationId", delete_notification);

export default router;